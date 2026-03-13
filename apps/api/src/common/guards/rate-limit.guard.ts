import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common"
import type { Request } from "express"
import { applyRateLimit } from "@mmx/lib/server/security/rate-limit"

interface RateLimitOptions {
  namespace: string
  limit: number
  windowMs: number
}

export function createRateLimitGuard(options: RateLimitOptions) {
  @Injectable()
  class RateLimitGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest<Request>()
      const ip = resolveIp(req)

      const result = applyRateLimit({
        namespace: options.namespace,
        key: ip,
        limit: options.limit,
        windowMs: options.windowMs,
      })

      if (!result.allowed) {
        throw new HttpException(
          {
            data: null,
            error: {
              code: "RATE_LIMITED",
              message: `Muitas tentativas. Tente novamente em ${result.retryAfterSeconds}s`,
            },
          },
          HttpStatus.TOO_MANY_REQUESTS,
        )
      }

      return true
    }
  }

  return RateLimitGuard
}

function resolveIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"]
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "unknown"
  if (Array.isArray(forwarded)) return forwarded[0]?.split(",")[0]?.trim() || "unknown"
  const realIp = req.headers["x-real-ip"]
  if (typeof realIp === "string") return realIp.trim()
  return "unknown"
}
