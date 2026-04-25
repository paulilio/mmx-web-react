import { Injectable, Inject } from "@nestjs/common"
import { sha256Hex } from "@/core/lib/server/security/token-hash"
import { hashPassword } from "@/core/lib/server/security/password-hash"
import { validatePassword } from "../../domain/auth-rules"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import {
  ONE_TIME_TOKEN_REPOSITORY,
  type IOneTimeTokenRepository,
} from "../ports/one-time-token-repository.port"
import {
  REFRESH_SESSION_REPOSITORY,
  type IRefreshSessionRepository,
} from "../ports/refresh-session-repository.port"

export interface ResetPasswordInput {
  rawToken: string
  newPassword: string
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ONE_TIME_TOKEN_REPOSITORY) private readonly tokenRepo: IOneTimeTokenRepository,
    @Inject(REFRESH_SESSION_REPOSITORY) private readonly sessionRepo: IRefreshSessionRepository,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    if (!input.rawToken) {
      throw Object.assign(new Error("Token ausente"), { status: 400, code: "TOKEN_MISSING" })
    }
    validatePassword(input.newPassword)

    const tokenHash = sha256Hex(input.rawToken)
    const tokenRow = await this.tokenRepo.findActiveByHash(tokenHash, "PASSWORD_RESET")
    if (!tokenRow) {
      throw Object.assign(new Error("Token inválido ou expirado"), { status: 400, code: "TOKEN_INVALID" })
    }

    const user = await this.userRepo.findById(tokenRow.userId)
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), { status: 404, code: "USER_NOT_FOUND" })
    }

    await this.tokenRepo.consume(tokenRow.id)
    await this.tokenRepo.invalidatePending(user.id, "PASSWORD_RESET")

    const newHash = await hashPassword(input.newPassword)
    await this.userRepo.update(user.id, {
      passwordHash: newHash,
      isEmailConfirmed: true,
    })

    // Revoga todas as sessões: a senha mudou.
    await this.sessionRepo.revokeAllForUser(user.id)
  }
}
