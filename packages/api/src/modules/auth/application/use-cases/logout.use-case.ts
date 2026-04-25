import { Injectable, Inject, Optional } from "@nestjs/common"
import {
  REFRESH_SESSION_REPOSITORY,
  type IRefreshSessionRepository,
} from "../ports/refresh-session-repository.port"
import { hashTokenWithSecret } from "@/core/lib/server/security/token-hash"
import { TokenBlacklistService } from "@/infrastructure/redis/token-blacklist.service"
import { AuditLogService } from "@/infrastructure/redis/audit-log.service"

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_SESSION_REPOSITORY) private readonly sessionRepo: IRefreshSessionRepository,
    @Optional() private readonly blacklist: TokenBlacklistService,
    @Optional() private readonly auditLog: AuditLogService,
  ) {}

  async execute(
    refreshToken: string | null,
    accessToken?: string | null,
    context?: { userId?: string; ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    const tokenHashSecret = process.env.TOKEN_HASH_SECRET
    if (!tokenHashSecret) {
      throw new Error("TOKEN_HASH_SECRET not configured")
    }

    // Revoke refresh token
    if (refreshToken) {
      const refreshHash = hashTokenWithSecret(refreshToken, tokenHashSecret)
      await this.sessionRepo.revokeByTokenHash(refreshHash)
    }

    // Add access token to blacklist (if provided)
    if (accessToken && this.blacklist) {
      await this.blacklist.addToBlacklist(accessToken, 1800) // 30min default
    }

    // Log audit event
    if (context?.userId && this.auditLog) {
      await this.auditLog.log({
        userId: context.userId,
        action: "logout",
        resourceType: "session",
        resourceId: "current",
        status: "success",
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      })
    }
  }
}


