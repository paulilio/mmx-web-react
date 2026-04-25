import { Injectable, Inject, Optional } from "@nestjs/common"
import type { Redis } from "ioredis"
import { REDIS_CLIENT } from "./redis.module"

export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId: string
  action: string
  resourceType: string
  resourceId: string
  details?: Record<string, unknown>
  status: "success" | "failure"
  ipAddress?: string
  userAgent?: string
}

/**
 * Audit logging service using Redis + optional persistence
 * Tracks security-relevant events: session revocation, permission changes, etc.
 */
@Injectable()
export class AuditLogService {
  private readonly prefix = "audit:"
  private readonly maxLogsPerUser = 1000

  constructor(@Optional() @Inject(REDIS_CLIENT) private readonly redis: Redis | null) {}

  /**
   * Log an audit event
   */
  async log(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<string> {
    if (!this.redis) {
      console.debug("[AuditLog] Redis unavailable; event NOT logged")
      return ""
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const auditEntry: AuditLogEntry = {
      ...entry,
      id,
      timestamp: new Date(),
    }

    const key = `${this.prefix}user:${entry.userId}`

    try {
      // Add to user's audit log list
      await this.redis.lpush(key, JSON.stringify(auditEntry))

      // Keep only last N entries
      await this.redis.ltrim(key, 0, this.maxLogsPerUser - 1)

      // Set expiration (90 days)
      await this.redis.expire(key, 90 * 24 * 60 * 60)

      console.debug(`[AuditLog] Logged: ${entry.action} for user ${entry.userId}`)
      return id
    } catch (err) {
      console.error("[AuditLog] Failed to log:", err)
      return ""
    }
  }

  /**
   * Get audit logs for a user
   */
  async getUserLogs(userId: string, limit: number = 50): Promise<AuditLogEntry[]> {
    if (!this.redis) return []

    const key = `${this.prefix}user:${userId}`

    try {
      const entries = await this.redis.lrange(key, 0, limit - 1)
      return entries.map((entry) => JSON.parse(entry) as AuditLogEntry)
    } catch (err) {
      console.error("[AuditLog] Failed to fetch logs:", err)
      return []
    }
  }

  /**
   * Get specific action logs (e.g., all session revocations)
   */
  async getActionLogs(action: string, limit: number = 100): Promise<AuditLogEntry[]> {
    if (!this.redis) return []

    try {
      // This would require a separate index; for now, scan all
      // In production, consider using Redis Streams instead
      const keys = await this.redis.keys(`${this.prefix}user:*`)
      const allLogs: AuditLogEntry[] = []

      for (const key of keys) {
        const entries = await this.redis.lrange(key, 0, -1)
        for (const entry of entries) {
          const parsed = JSON.parse(entry) as AuditLogEntry
          if (parsed.action === action) {
            allLogs.push(parsed)
          }
        }
      }

      return allLogs.slice(0, limit)
    } catch (err) {
      console.error("[AuditLog] Failed to fetch action logs:", err)
      return []
    }
  }

  /**
   * Clear audit logs (for user or globally)
   */
  async clear(userId?: string): Promise<void> {
    if (!this.redis) return

    try {
      if (userId) {
        await this.redis.del(`${this.prefix}user:${userId}`)
      } else {
        const keys = await this.redis.keys(`${this.prefix}*`)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      }
    } catch (err) {
      console.error("[AuditLog] Failed to clear logs:", err)
    }
  }
}
