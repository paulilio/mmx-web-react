import { Injectable, Inject, Optional } from "@nestjs/common"
import type { Redis } from "ioredis"
import { REDIS_CLIENT } from "./redis.module"

/**
 * Redis-backed token blacklist service
 * Maintains a set of revoked access tokens with automatic TTL-based cleanup
 */
@Injectable()
export class TokenBlacklistService {
  private readonly prefix = "blacklist:token:"

  constructor(@Optional() @Inject(REDIS_CLIENT) private readonly redis: Redis | null) {}

  /**
   * Add token to blacklist with automatic expiration
   */
  async addToBlacklist(token: string, expiresInSeconds: number): Promise<void> {
    if (!this.redis) {
      console.debug("[TokenBlacklist] Redis unavailable; token NOT blacklisted")
      return
    }

    const key = `${this.prefix}${token}`
    try {
      await this.redis.setex(key, expiresInSeconds, "revoked")
      console.debug(`[TokenBlacklist] Added token (expires in ${expiresInSeconds}s)`)
    } catch (err) {
      console.error("[TokenBlacklist] Failed to blacklist token:", err)
      // Fail silently to not break auth flow
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isBlacklisted(token: string): Promise<boolean> {
    if (!this.redis) return false

    const key = `${this.prefix}${token}`
    try {
      const result = await this.redis.get(key)
      return result !== null
    } catch (err) {
      console.error("[TokenBlacklist] Failed to check blacklist:", err)
      return false // Fail open to not break auth
    }
  }

  /**
   * Remove token from blacklist (optional cleanup)
   */
  async removeFromBlacklist(token: string): Promise<void> {
    if (!this.redis) return

    const key = `${this.prefix}${token}`
    try {
      await this.redis.del(key)
    } catch (err) {
      console.error("[TokenBlacklist] Failed to remove from blacklist:", err)
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{ redisConnected: boolean; keysCount: number }> {
    if (!this.redis) {
      return { redisConnected: false, keysCount: 0 }
    }

    try {
      const keys = await this.redis.keys(`${this.prefix}*`)
      return { redisConnected: true, keysCount: keys.length }
    } catch {
      return { redisConnected: false, keysCount: 0 }
    }
  }
}
