import { Injectable, Inject } from "@nestjs/common"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import {
  REFRESH_SESSION_REPOSITORY,
  type IRefreshSessionRepository,
} from "../ports/refresh-session-repository.port"
import { type AuthUserView, toAuthUserView } from "../../domain/user.types"
import {
  validateLoginInput,
  normalizeEmail,
  type LoginAuthInput,
} from "../../domain/auth-rules"
import { verifyPassword } from "@/core/lib/server/security/password-hash"
import { issueAccessToken, issueRefreshToken } from "@/core/lib/server/security/jwt"
import { resolveUserScopes } from "@/core/lib/server/security/permissions"
import { sha256Hex } from "@/core/lib/server/security/token-hash"

export interface LoginOutput {
  user: AuthUserView
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginContext {
  userAgent?: string | null
  ipAddress?: string | null
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(REFRESH_SESSION_REPOSITORY) private readonly sessionRepo: IRefreshSessionRepository,
  ) {}

  async execute(input: LoginAuthInput, context: LoginContext = {}): Promise<LoginOutput> {
    validateLoginInput(input)

    const email = normalizeEmail(input.email)
    const user = await this.userRepo.findByEmail(email)

    if (!user || !user.passwordHash) {
      throw Object.assign(new Error("Credenciais inválidas"), { status: 401, code: "INVALID_CREDENTIALS" })
    }

    const valid = await verifyPassword(input.password, user.passwordHash)
    if (!valid) {
      throw Object.assign(new Error("Credenciais inválidas"), { status: 401, code: "INVALID_CREDENTIALS" })
    }

    if (!user.isEmailConfirmed) {
      throw Object.assign(new Error("Confirme seu email para acessar a conta"), {
        status: 403,
        code: "EMAIL_NOT_CONFIRMED",
      })
    }

    await this.userRepo.update(user.id, { lastLogin: new Date() })

    const scopes = resolveUserScopes({ role: "user" })
    const accessResult = issueAccessToken({ id: user.id, email: user.email, scopes, roles: ["user"] })
    const refreshResult = issueRefreshToken({ id: user.id, email: user.email })

    await this.sessionRepo.create({
      userId: user.id,
      tokenHash: sha256Hex(refreshResult.token),
      expiresAt: new Date(Date.now() + refreshResult.expiresInSeconds * 1000),
      userAgent: context.userAgent ?? null,
      ipAddress: context.ipAddress ?? null,
    })

    return {
      user: toAuthUserView(user),
      accessToken: accessResult.token,
      refreshToken: refreshResult.token,
      expiresIn: accessResult.expiresInSeconds,
    }
  }
}
