import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { REQUIRED_SCOPES_KEY } from "../decorators/auth.decorators"
import type { Scope } from "@/core/lib/server/security/permissions"

/**
 * Guard to enforce scope-based access control
 * Works with @RequireScope decorator
 */
@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<Scope[]>(REQUIRED_SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredScopes || requiredScopes.length === 0) {
      return true // No specific scopes required
    }

    const req = context.switchToHttp().getRequest()
    const userScopes: Scope[] = req.scopes || []

    // Check if user has any of the required scopes
    const hasRequiredScope = requiredScopes.some((scope) => userScopes.includes(scope))

    if (!hasRequiredScope) {
      throw new ForbiddenException({
        code: "INSUFFICIENT_SCOPE",
        message: `Required scope not granted. Need: ${requiredScopes.join(", ")}`,
        requiredScopes,
        userScopes,
      })
    }

    return true
  }
}
