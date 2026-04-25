import { Injectable, Inject } from "@nestjs/common"
import {
  REFRESH_SESSION_REPOSITORY,
  type IRefreshSessionRepository,
} from "../ports/refresh-session-repository.port"
import { hashTokenWithSecret } from "@/core/lib/server/security/token-hash"
import { TokenBlacklistService } from "@/core/lib/server/security/token-blacklist.service"

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_SESSION_REPOSITORY) private readonly sessionRepo: IRefreshSessionRepository,
    private readonly blacklist: TokenBlacklistService,
  ) {}

  async execute(refreshToken: string | null, accessToken?: string | null): Promise<void> {
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
    if (accessToken) {
      // Use token string as identifier (or parse jti if available)
      await this.blacklist.addToBlacklist(accessToken, 1800) // 30min default
    }
  }
}

