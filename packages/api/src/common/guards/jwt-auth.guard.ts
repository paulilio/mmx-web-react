import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common"
import type { Request } from "express"
import type { Scope } from "@/core/lib/server/security/permissions"
import { verifyAccessToken } from "@/core/lib/server/security/jwt"

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
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { userId?: string; scopes?: Scope[]; roles?: string[] }>()
    const token = extractToken(req)

    if (!token) {
      throw new UnauthorizedException({ code: "AUTH_REQUIRED", message: "Autenticacao obrigatoria" })
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
