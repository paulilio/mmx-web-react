import { Injectable, Inject } from "@nestjs/common"
import {
  verifyRefreshToken,
  issueAccessToken,
  issueRefreshToken,
} from "@/core/lib/server/security/jwt"
import { hashTokenWithSecret } from "@/core/lib/server/security/token-hash"
import {
  REFRESH_SESSION_REPOSITORY,
  type IRefreshSessionRepository,
} from "../ports/refresh-session-repository.port"

export interface RefreshSessionOutput {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshContext {
  userAgent?: string | null
  ipAddress?: string | null
}

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(REFRESH_SESSION_REPOSITORY) private readonly sessionRepo: IRefreshSessionRepository,
  ) {}

  async execute(currentRefreshToken: string, context: RefreshContext = {}): Promise<RefreshSessionOutput> {
    let payload
    try {
      payload = verifyRefreshToken(currentRefreshToken)
    } catch {
      throw Object.assign(new Error("Refresh token inválido"), { status: 401, code: "INVALID_REFRESH_TOKEN" })
    }

    const tokenHashSecret = process.env.TOKEN_HASH_SECRET
    if (!tokenHashSecret) {
      throw new Error("TOKEN_HASH_SECRET not configured")
    }

    const currentHash = hashTokenWithSecret(currentRefreshToken, tokenHashSecret)
    const session = await this.sessionRepo.findActiveByTokenHash(currentHash)

    if (!session || session.userId !== payload.sub) {
      // Replay/uso inválido — revoga TODAS as sessões do usuário como contramedida.
      await this.sessionRepo.revokeAllForUser(payload.sub)
      throw Object.assign(new Error("Refresh token inválido"), { status: 401, code: "INVALID_REFRESH_TOKEN" })
    }

    await this.sessionRepo.revokeByTokenHash(currentHash)

    const accessRhashTokenWithSecret(nextRefreshResult.token, tokenHashSecretyload.sub, email: payload.email })
    const nextRefreshResult = issueRefreshToken({ id: payload.sub, email: payload.email })

    await this.sessionRepo.create({
      userId: payload.sub,
      tokenHash: sha256Hex(nextRefreshResult.token),
      expiresAt: new Date(Date.now() + nextRefreshResult.expiresInSeconds * 1000),
      userAgent: context.userAgent ?? null,
      ipAddress: context.ipAddress ?? null,
    })

    return {
      accessToken: accessResult.token,
      refreshToken: nextRefreshResult.token,
      expiresIn: accessResult.expiresInSeconds,
    }
  }
}
