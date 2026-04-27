import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common"
import type { Request } from "express"

@Injectable()
export class BelvoIpAllowlistGuard implements CanActivate {
  private readonly logger = new Logger(BelvoIpAllowlistGuard.name)

  canActivate(context: ExecutionContext): boolean {
    const csv = process.env.BELVO_WEBHOOK_IPS
    if (!csv?.trim()) return true

    const allowed = csv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    if (allowed.length === 0) return true

    const req = context.switchToHttp().getRequest<Request>()
    const remote = extractClientIp(req)

    if (!allowed.includes(remote)) {
      this.logger.warn(`Webhook Belvo recusado de IP=${remote} (allowlist=${allowed.join(",")})`)
      throw new UnauthorizedException({
        data: null,
        error: { code: "IP_NOT_ALLOWED", message: "IP de origem não permitido" },
      })
    }

    return true
  }
}

export function extractClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"]
  if (typeof forwarded === "string") {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  if (Array.isArray(forwarded)) {
    const first = forwarded[0]?.split(",")[0]?.trim()
    if (first) return first
  }
  const realIp = req.headers["x-real-ip"]
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim()
  return req.ip ?? "unknown"
}
