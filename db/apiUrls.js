import supabase, { supabaseUrl } from "./supabase";
import { rateLimit, getIdentifier } from "./rate-limiter";
import { redis } from "./redis-client";

// Cache TTL in seconds
const CACHE_TTL = 3600; // 1 hour
const URL_LIST_TTL = 300; // 5 minutes

// Rate limit configuration
const URL_CREATE_LIMIT = 10; // 10 URL creations
const URL_CREATE_DURATION = 60; // per minute
const URL_READ_LIMIT = 20; // 30 URL reads
const URL_READ_DURATION = 10; // per 10 seconds
const URL_DELETE_LIMIT = 10; // 10 URL deletions
const URL_DELETE_DURATION = 60; // per minute

// Cache key generators
const getUrlCacheKey = (id) => `url:${id}`;
const getUserUrlsCacheKey = (userId) => `user_urls:${userId}`;
const getShortUrlCacheKey = (shortId) => `short_url:${shortId}`;

// Cache helpers
async function cacheUrl(url) {
  if (!url) return;
  const cacheKey = getUrlCacheKey(url.id);
  await redis.set(cacheKey, JSON.stringify(url), { ex: CACHE_TTL });
}

async function invalidateUrlCache(id) {
  await redis.del(getUrlCacheKey(id));
}

async function invalidateUserUrlsCache(userId) {
  await redis.del(getUserUrlsCacheKey(userId));
}

export async function getUrls(user_id, req) {
  // Check rate limit for URL listing
  const identifier = getIdentifier(req);
  const rateLimitResult = await rateLimit(
    `url-list:${identifier}`,
    URL_READ_LIMIT,
    URL_READ_DURATION
  );

  if (!rateLimitResult.success) {
    throw new Error(
      `Rate limit exceeded. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    );
  }

  // Try to get from cache first
  const cacheKey = getUserUrlsCacheKey(user_id);
  const cachedUrls = await redis.get(cacheKey);
  
  if (cachedUrls) {
    return JSON.parse(cachedUrls);
  }

  // If not in cache, get from database
  let { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load URLs");
  }

  // Cache the results
  if (data) {
    await redis.set(cacheKey, JSON.stringify(data), { ex: URL_LIST_TTL });
    // Cache individual URLs
    await Promise.all(data.map(url => cacheUrl(url)));
  }

  return data;
}

export async function getUrl({ id, user_id }, req) {
  // Check rate limit for URL retrieval
  const identifier = getIdentifier(req);
  const rateLimitResult = await rateLimit(
    `url-get:${identifier}`,
    URL_READ_LIMIT,
    URL_READ_DURATION
  );

  if (!rateLimitResult.success) {
    throw new Error(
      `Rate limit exceeded. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    );
  }

  // Try to get from cache first
  const cacheKey = getUrlCacheKey(id);
  const cachedUrl = await redis.get(cacheKey);
  
  if (cachedUrl) {
    const url = JSON.parse(cachedUrl);
    // Verify user ownership even for cached URLs
    if (url.user_id === user_id) {
      return url;
    }
  }

  // If not in cache or unauthorized, get from database
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Short Url not found");
  }

  // Cache the result
  if (data) {
    await cacheUrl(data);
  }

  return data;
}

export async function getLongUrl(id, req) {
  // Check rate limit for URL redirection
  const identifier = getIdentifier(req);
  const rateLimitResult = await rateLimit(
    `url-redirect:${identifier}`,
    URL_READ_LIMIT,
    URL_READ_DURATION
  );

  if (!rateLimitResult.success) {
    throw new Error(
      `Rate limit exceeded. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    );
  }

  // Try to get from cache first
  const shortUrlKey = getShortUrlCacheKey(id);
  const cachedShortUrl = await redis.get(shortUrlKey);

  if (cachedShortUrl) {
    return JSON.parse(cachedShortUrl);
  }

  // If not in cache, get from database
  let { data: shortLinkData, error: shortLinkError } = await supabase
    .from("urls")
    .select("id, original_url")
    .or(`short_url.eq.${id},custom_url.eq.${id}`)
    .single();

  if (shortLinkError && shortLinkError.code !== "PGRST116") {
    console.error("Error fetching short link:", shortLinkError);
    return;
  }

  // Cache the result
  if (shortLinkData) {
    await redis.set(shortUrlKey, JSON.stringify(shortLinkData), { ex: CACHE_TTL });
  }

  return shortLinkData;
}

export async function createUrl({ title, longUrl, customUrl, user_id }, qrcode, req) {
  // Check rate limit for URL creation
  const identifier = getIdentifier(req);
  const rateLimitResult = await rateLimit(
    `url-create:${identifier}`,
    URL_CREATE_LIMIT,
    URL_CREATE_DURATION
  );

  if (!rateLimitResult.success) {
    throw new Error(
      `Too many URL creations. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    );
  }

  const short_url = Math.random().toString(36).substr(2, 6);
  const fileName = `qr-${short_url}`;

  const { error: storageError } = await supabase.storage
    .from("qrs")
    .upload(fileName, qrcode);

  if (storageError) throw new Error(storageError.message);

  const qr_code = `${supabaseUrl}/storage/v1/object/public/qrs/${fileName}`;

  const { data, error } = await supabase
    .from("urls")
    .insert([
      {
        title,
        user_id,
        original_url: longUrl,
        custom_url: customUrl || null,
        short_url,
        qr_code,
      },
    ])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error creating short URL");
  }

  if (data) {
    // Cache the new URL
    await cacheUrl(data[0]);
    // Invalidate user's URL list cache to force a refresh
    await invalidateUserUrlsCache(user_id);
  }

  return data;
}

export async function deleteUrl(id, req) {
  // Check rate limit for URL deletion
  const identifier = getIdentifier(req);
  const rateLimitResult = await rateLimit(
    `url-delete:${identifier}`,
    URL_DELETE_LIMIT,
    URL_DELETE_DURATION
  );

  if (!rateLimitResult.success) {
    throw new Error(
      `Too many deletion attempts. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    );
  }

  // Get the URL first to know the user_id for cache invalidation
  const { data: urlData } = await supabase
    .from("urls")
    .select("user_id, short_url, custom_url")
    .eq("id", id)
    .single();

  const { data, error } = await supabase.from("urls").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Unable to delete Url");
  }

  if (urlData) {
    // Invalidate all related caches
    await Promise.all([
      invalidateUrlCache(id),
      invalidateUserUrlsCache(urlData.user_id),
      redis.del(getShortUrlCacheKey(urlData.short_url)),
      urlData.custom_url && redis.del(getShortUrlCacheKey(urlData.custom_url))
    ]);
  }

  return data;
}
