import { Injectable, NestMiddleware } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction) {
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY")
    // Prevent MIME-type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff")
    // XSS protection for legacy browsers
    res.setHeader("X-XSS-Protection", "1; mode=block")
    // Control referrer information
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
    // Restrict browser features
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    // Remove server disclosure
    res.removeHeader("X-Powered-By")
    // HSTS in production
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    }
    next()
  }
}
