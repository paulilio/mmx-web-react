import { Module } from "@nestjs/common"
import { Redis } from "ioredis"

export const REDIS_CLIENT = Symbol("RedisClient")

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL
        if (!redisUrl) {
          console.warn("[Redis] REDIS_URL not configured; token blacklist disabled")
          return null
        }

        const redis = new Redis(redisUrl, {
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000)
            return delay
          },
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          enableOfflineQueue: false,
        })

        redis.on("error", (err) => console.error("[Redis] Connection error:", err))
        redis.on("connect", () => console.log("[Redis] Connected"))
        redis.on("disconnect", () => console.log("[Redis] Disconnected"))

        return redis
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
