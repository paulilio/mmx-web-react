import { Injectable, Inject } from "@nestjs/common"
import { authConfig } from "@/config/auth.config"
import { sha256Hex, generateOpaqueToken } from "@/core/lib/server/security/token-hash"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import {
  ONE_TIME_TOKEN_REPOSITORY,
  type IOneTimeTokenRepository,
} from "../ports/one-time-token-repository.port"
import { EMAIL_SERVICE, type IEmailService } from "../ports/email-service.port"
import { normalizeEmail, validateEmail } from "../../domain/auth-rules"

export interface ForgotPasswordInput {
  email: string
  ipAddress?: string | null
}

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ONE_TIME_TOKEN_REPOSITORY) private readonly tokenRepo: IOneTimeTokenRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<void> {
    validateEmail(input.email)
    const email = normalizeEmail(input.email)
    const user = await this.userRepo.findByEmail(email)

    // Anti-enumeration: sempre responde 200 OK no controller. Aqui apenas envia email se usuário existe.
    if (!user || !user.passwordHash) return

    await this.tokenRepo.invalidatePending(user.id, "PASSWORD_RESET")

    const rawToken = generateOpaqueToken(32)
    const tokenHash = sha256Hex(rawToken)
    const expiresAt = new Date(Date.now() + authConfig.tokens.passwordResetTtlSeconds * 1000)

    await this.tokenRepo.create({
      userId: user.id,
      tokenHash,
      purpose: "PASSWORD_RESET",
      expiresAt,
      ipAddress: input.ipAddress ?? null,
    })

    const resetUrl = `${authConfig.frontendUrl.replace(/\/$/, "")}/auth/reset-password?token=${encodeURIComponent(rawToken)}`
    await this.emailService.sendPasswordResetEmail({
      to: user.email,
      recipientName: user.firstName || "usuário(a)",
      resetUrl,
    })
  }
}
