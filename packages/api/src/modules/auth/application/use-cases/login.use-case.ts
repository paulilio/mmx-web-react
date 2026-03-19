import { Injectable, Inject } from "@nestjs/common"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import { type AuthUserView, toAuthUserView } from "../../domain/user.types"
import {
  validateLoginInput,
  normalizeEmail,
  type LoginAuthInput,
} from "../../domain/auth-rules"
import { verifyPassword } from "@/core/lib/server/security/password-hash"
import { issueAccessToken, issueRefreshToken } from "@/core/lib/server/security/jwt"
import { persistRefreshSession } from "@/core/lib/server/security/refresh-session-store"

export interface LoginOutput {
  user: AuthUserView
  accessToken: string
  refreshToken: string
  expiresIn: number
}

@Injectable()
export class LoginUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository) {}

  async execute(input: LoginAuthInput): Promise<LoginOutput> {
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

    await this.userRepo.update(user.id, { lastLogin: new Date() })

    const accessResult = issueAccessToken({ id: user.id, email: user.email })
    const refreshResult = issueRefreshToken({ id: user.id, email: user.email })
    persistRefreshSession(refreshResult.token, user.id, refreshResult.expiresInSeconds)

    return {
      user: toAuthUserView(user),
      accessToken: accessResult.token,
      refreshToken: refreshResult.token,
      expiresIn: accessResult.expiresInSeconds,
    }
  }
}
