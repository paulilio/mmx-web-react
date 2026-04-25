import { Injectable, Inject, Optional } from "@nestjs/common"
import type { Redis } from "ioredis"
import { REDIS_CLIENT } from "./redis.module"

export interface RateLimitConfig {
  maxRequests: number
  windowSeconds: number
}

/**
 * User-based rate limiting service using Redis
 * Tracks API calls per user with sliding window
 */
@Injectable()
export class RateLimitService {
  private readonly defaultConfig: RateLimitConfig = {
    maxRequests: 100, // 100 requests per window
    windowSeconds: 60, // per 1 minute
  }

  constructor(@Optional() @Inject(REDIS_CLIENT) private readonly redis: Redis | null) {}

  /**
   * Check if user has exceeded rate limit
   * Returns: { allowed: boolean, remaining: number, resetAt: number }
   */
  async checkLimit(userId: string, config?: RateLimitConfig): Promise<{
    allowed: boolean
    remaining: number
    resetAt: number
  }> {
    if (!this.redis) {
      // Redis unavailable; allow all requests
      return { allowed: true, remaining: -1, resetAt: 0 }
    }

    const cfg = config || this.defaultConfig
    const key = `ratelimit:${userId}`

    try {
      const current = await this.redis.incr(key)

      if (current === 1) {
        // First request; set expiration
        await this.redis.expire(key, cfg.windowSeconds)
      }

      const ttl = await this.redis.ttl(key)
      const resetAt = Date.now() + ttl * 1000

      const allowed = current <= cfg.maxRequests
      const remaining = Math.max(0, cfg.maxRequests - current)

      return { allowed, remaining, resetAt }
    } catch (err) {
      console.error("[RateLimit] Check failed:", err)
      return { allowed: true, remaining: -1, resetAt: 0 }
    }
  }

  /**
   * Reset user's rate limit (e.g., after payment or for testing)
   */
  async reset(userId: string): Promise<void> {
    if (!this.redis) return

    const key = `ratelimit:${userId}`
    try {
      await this.redis.del(key)
    } catch (err) {
      console.error("[RateLimit] Reset failed:", err)
    }
  }

  /**
   * Get current usage for user
   */
  async getUsage(userId: string): Promise<{ current: number; limit: number; resetAt: number }> {
    if (!this.redis) {
      return { current: 0, limit: this.defaultConfig.maxRequests, resetAt: 0 }
    }

    const key = `ratelimit:${userId}`

    try {
      const current = await this.redis.get(key)
      const ttl = await this.redis.ttl(key)
      const resetAt = ttl > 0 ? Date.now() + ttl * 1000 : Date.now()

      return {
        current: current ? parseInt(current) : 0,
        limit: this.defaultConfig.maxRequests,
        resetAt,
      }
    } catch (err) {
      console.error("[RateLimit] Get usage failed:", err)
      return { current: 0, limit: this.defaultConfig.maxRequests, resetAt: 0 }
    }
  }
}
