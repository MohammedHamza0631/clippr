import supabase, { supabaseUrl } from "./supabase";
import { rateLimit, getIdentifier } from "./rate-limiter";

// Rate limit configuration
const URL_CREATE_LIMIT = 10; // 10 URL creations
const URL_CREATE_DURATION = 60; // per minute
const URL_READ_LIMIT = 20; // 30 URL reads
const URL_READ_DURATION = 10; // per 10 seconds
const URL_DELETE_LIMIT = 10; // 10 URL deletions
const URL_DELETE_DURATION = 60; // per minute

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

  let { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load URLs");
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

  let { data: shortLinkData, error: shortLinkError } = await supabase
    .from("urls")
    .select("id, original_url")
    .or(`short_url.eq.${id},custom_url.eq.${id}`)
    .single();

  if (shortLinkError && shortLinkError.code !== "PGRST116") {
    console.error("Error fetching short link:", shortLinkError);
    return;
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

  const { data, error } = await supabase.from("urls").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Unable to delete Url");
  }

  return data;
}
