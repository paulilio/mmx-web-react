import { Injectable, NestMiddleware } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"
import { RateLimitService } from "@/infrastructure/redis/rate-limit.service"

/**
 * Middleware for per-user rate limiting
 * Enforces max requests per time window
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly rateLimitService: RateLimitService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = (req as Request & { userId?: string }).userId

    // Only rate limit authenticated users
    if (!userId) {
      next()
      return
    }

    const { allowed, remaining, resetAt } = await this.rateLimitService.checkLimit(userId)

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", "100")
    res.setHeader("X-RateLimit-Remaining", remaining.toString())
    res.setHeader("X-RateLimit-Reset", new Date(resetAt).toISOString())

    if (!allowed) {
      res.status(429).json({
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
        resetAt: new Date(resetAt).toISOString(),
      })
      return
    }

    next()
  }
}
