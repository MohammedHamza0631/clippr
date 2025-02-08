import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Initialize rate limiter
// This allows 20 requests per 10 seconds
const limiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
});

// Cache TTL in seconds (e.g., 1 hour)
const CACHE_TTL = 3600;

export async function checkRateLimit(identifier) {
  const { success, limit, reset, remaining } = await limiter.limit(identifier);
  return { success, limit, reset, remaining };
}

export async function getCachedUrl(shortId) {
  const cacheKey = `url:${shortId}`;
  const cachedData = await redis.get(cacheKey);
  return cachedData;
}

export async function cacheUrl(shortId, urlData) {
  const cacheKey = `url:${shortId}`;
  await redis.set(cacheKey, urlData, {
    ex: CACHE_TTL, // expires in 1 hour
  });
}

export async function invalidateUrlCache(shortId) {
  const cacheKey = `url:${shortId}`;
  await redis.del(cacheKey);
}
