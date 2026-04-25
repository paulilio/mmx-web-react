import { SetMetadata, createParamDecorator, ExecutionContext } from "@nestjs/common"
import type { Scope } from "@/core/lib/server/security/permissions"

/**
 * Decorator to require specific scopes for endpoint access
 * Usage: @RequireScope("read:transactions", "write:transactions")
 */
export const REQUIRED_SCOPES_KEY = "required_scopes"

export function RequireScope(...scopes: Scope[]) {
  return SetMetadata(REQUIRED_SCOPES_KEY, scopes)
}

/**
 * Decorator to get current user's scopes from request
 * Usage: constructor(private scopes: Scope[]) in controller
 */
export const CurrentScopes = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Scope[] => {
    const req = ctx.switchToHttp().getRequest()
    return req.scopes || []
  },
)

/**
 * Decorator to get current user's roles from request
 */
export const CurrentRoles = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const req = ctx.switchToHttp().getRequest()
    return req.roles || []
  },
)

/**
 * Decorator to get current user ID
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest()
    return req.userId || ""
  },
)
