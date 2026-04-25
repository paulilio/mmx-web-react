import { Injectable, Inject } from "@nestjs/common"
import { sha256Hex } from "@/core/lib/server/security/token-hash"
import { issueAccessToken, issueRefreshToken } from "@/core/lib/server/security/jwt"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import {
  ONE_TIME_TOKEN_REPOSITORY,
  type IOneTimeTokenRepository,
} from "../ports/one-time-token-repository.port"
import {
  REFRESH_SESSION_REPOSITORY,
  type IRefreshSessionRepository,
} from "../ports/refresh-session-repository.port"
import { type AuthUserView, toAuthUserView } from "../../domain/user.types"

export interface VerifyEmailInput {
  rawToken: string
  userAgent?: string | null
  ipAddress?: string | null
}

export interface VerifyEmailOutput {
  user: AuthUserView
  accessToken: string
  refreshToken: string
  expiresIn: number
}

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ONE_TIME_TOKEN_REPOSITORY) private readonly tokenRepo: IOneTimeTokenRepository,
    @Inject(REFRESH_SESSION_REPOSITORY) private readonly sessionRepo: IRefreshSessionRepository,
  ) {}

  async execute(input: VerifyEmailInput): Promise<VerifyEmailOutput> {
    if (!input.rawToken) {
      throw Object.assign(new Error("Token ausente"), { status: 400, code: "TOKEN_MISSING" })
    }

    const tokenHash = sha256Hex(input.rawToken)
    const tokenRow = await this.tokenRepo.findActiveByHash(tokenHash, "EMAIL_VERIFY")
    if (!tokenRow) {
      throw Object.assign(new Error("Token inválido ou expirado"), { status: 400, code: "TOKEN_INVALID" })
    }

    const user = await this.userRepo.findById(tokenRow.userId)
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), { status: 404, code: "USER_NOT_FOUND" })
    }

    await this.tokenRepo.consume(tokenRow.id)

    const updated = user.isEmailConfirmed
      ? user
      : await this.userRepo.update(user.id, { isEmailConfirmed: true, lastLogin: new Date() })

    const accessResult = issueAccessToken({ id: updated.id, email: updated.email })
    const refreshResult = issueRefreshToken({ id: updated.id, email: updated.email })

    await this.sessionRepo.create({
      userId: updated.id,
      tokenHash: sha256Hex(refreshResult.token),
      expiresAt: new Date(Date.now() + refreshResult.expiresInSeconds * 1000),
      userAgent: input.userAgent ?? null,
      ipAddress: input.ipAddress ?? null,
    })

    return {
      user: toAuthUserView(updated),
      accessToken: accessResult.token,
      refreshToken: refreshResult.token,
      expiresIn: accessResult.expiresInSeconds,
    }
  }
}
