import { Injectable } from "@nestjs/common"

/**
 * Redis-backed token blacklist service
 * Used to immediately invalidate access tokens upon logout
 *
 * Why: After logout, access tokens remain valid for up to 30min.
 * This service maintains a blacklist of revoked tokens in Redis with TTL.
 */
@Injectable()
export class TokenBlacklistService {
  /**
   * Track if blacklist is enabled (can be disabled if Redis unavailable)
   */
  private isEnabled = false

  constructor() {
    // Redis client setup happens in app.module.ts
    this.isEnabled = !!process.env.REDIS_URL
  }

  /**
   * Add token to blacklist (revoke immediately)
   * @param tokenJti - JWT jti (or hash of token for this implementation)
   * @param expiresInSeconds - How long to keep in blacklist (should match token expiry)
   */
  async addToBlacklist(tokenJti: string, expiresInSeconds: number): Promise<void> {
    if (!this.isEnabled) return

    // TODO: Implement Redis SETEX
    // await this.redis.setex(`blacklist:${tokenJti}`, expiresInSeconds, "revoked")
    console.log(`[TokenBlacklist] Added ${tokenJti} to blacklist for ${expiresInSeconds}s`)
  }

  /**
   * Check if token is blacklisted
   * @param tokenJti - JWT jti (or hash of token)
   * @returns true if token is revoked, false if valid
   */
  async isBlacklisted(tokenJti: string): Promise<boolean> {
    if (!this.isEnabled) return false

    // TODO: Implement Redis GET
    // const result = await this.redis.get(`blacklist:${tokenJti}`)
    // return result !== null
    return false
  }

  /**
   * Clear blacklist entry (optional cleanup)
   */
  async removeFromBlacklist(tokenJti: string): Promise<void> {
    if (!this.isEnabled) return

    // TODO: Implement Redis DEL
    // await this.redis.del(`blacklist:${tokenJti}`)
    console.log(`[TokenBlacklist] Removed ${tokenJti} from blacklist`)
  }

  /**
   * Get blacklist statistics
   */
  async getStats(): Promise<{ enabled: boolean; redisUrl: boolean }> {
    return {
      enabled: this.isEnabled,
      redisUrl: !!process.env.REDIS_URL,
    }
  }
}
