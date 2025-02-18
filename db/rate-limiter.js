import { Redis } from '@upstash/redis'

// Initialize Redis client
let redis
try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
} catch (error) {
  console.warn('Redis client initialization failed:', error)
}

// In-memory fallback for rate limiting
const inMemoryStore = new Map()

// Clean up in-memory store every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of inMemoryStore.entries()) {
      if (now - value.timestamp > 3600000) { // 1 hour
        inMemoryStore.delete(key)
      }
    }
  }, 3600000) // Run every hour
}

export async function rateLimit(identifier, limit = 10, duration = 60) {
  try {
    if (!redis) {
      return await inMemoryRateLimit(identifier, limit, duration)
    }

    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const windowStart = now - (duration * 1000)

    // Add the current timestamp and remove old entries
    await redis.zadd(key, { score: now, member: now.toString() })
    await redis.zremrangebyscore(key, 0, windowStart)

    // Get the count of requests in the current window
    const count = await redis.zcard(key)

    // Set expiry for the key
    await redis.expire(key, duration)

    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      reset: now + (duration * 1000),
    }
  } catch (error) {
    console.warn('Redis rate limiting failed:', error)
    return await inMemoryRateLimit(identifier, limit, duration)
  }
}

async function inMemoryRateLimit(identifier, limit, duration) {
  const now = Date.now()
  const key = `rate_limit:${identifier}`
  const windowStart = now - (duration * 1000)

  // Get or create the rate limit entry
  let entry = inMemoryStore.get(key)
  if (!entry) {
    entry = {
      timestamps: [],
      timestamp: now
    }
    inMemoryStore.set(key, entry)
  }

  // Remove old timestamps
  entry.timestamps = entry.timestamps.filter(ts => ts > windowStart)

  // Add current timestamp
  entry.timestamps.push(now)
  entry.timestamp = now

  const count = entry.timestamps.length

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: now + (duration * 1000),
  }
}

// Generate a unique identifier based on available information
export function getIdentifier(req) {
  if (typeof window === 'undefined') {
    // Server-side
    if (req?.headers) {
      const forwarded = req.headers['x-forwarded-for']
      const ip = forwarded ? forwarded.split(/, /)[0] : req.headers['x-real-ip'] || 'unknown'
      return `${ip}`
    }
    return 'server'
  } else {
    // Client-side
    const sessionId = typeof localStorage !== 'undefined' ? localStorage.getItem('session_id') : null
    if (!sessionId && typeof localStorage !== 'undefined') {
      const newSessionId = Math.random().toString(36).substring(2)
      localStorage.setItem('session_id', newSessionId)
      return `client:${newSessionId}`
    }
    return `client:${sessionId || 'unknown'}`
  }
} 