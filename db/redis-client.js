import { Redis } from '@upstash/redis'

// Initialize Redis client
let redis
try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
} catch (error) {
  console.error('Redis client initialization failed:', error)
  // Fallback to a mock cache if Redis is not available
  redis = {
    get: async () => null,
    set: async () => null,
    del: async () => null,
  }
}

export { redis } 