import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  Optional,
} from "@nestjs/common"
import type { Request } from "express"
import type { Scope } from "@/core/lib/server/security/permissions"
import { verifyAccessToken } from "@/core/lib/server/security/jwt"
import { TokenBlacklistService } from "@/infrastructure/redis/token-blacklist.service"

declare global {
  namespace Express {
    interface Request {
      userId?: string
      scopes?: Scope[]
      roles?: string[]
    }
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Optional()
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { userId?: string; scopes?: Scope[]; roles?: string[] }>()
    const token = extractToken(req)

    if (!token) {
      throw new UnauthorizedException({ code: "AUTH_REQUIRED", message: "Autenticacao obrigatoria" })
    }

    // Check if token is blacklisted
    if (this.tokenBlacklist) {
      const isBlacklisted = await this.tokenBlacklist.isBlacklisted(token)
      if (isBlacklisted) {
        throw new UnauthorizedException({ code: "TOKEN_REVOKED", message: "Token foi revogado" })
      }
    }

    try {
      const payload = verifyAccessToken(token)
      req.userId = payload.sub
      req.scopes = payload.scopes || []
      req.roles = payload.roles || []
      return true
    } catch {
      throw new UnauthorizedException({ code: "INVALID_TOKEN", message: "Token invalido ou expirado" })
    }
  }
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7)
  }
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies
  return cookies?.mmx_access_token ?? null
}
