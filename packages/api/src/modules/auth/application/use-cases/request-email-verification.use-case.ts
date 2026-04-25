import { Injectable, Inject } from "@nestjs/common"
import { authConfig } from "@/config/auth.config"
import { sha256Hex, generateOpaqueToken } from "@/core/lib/server/security/token-hash"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import {
  ONE_TIME_TOKEN_REPOSITORY,
  type IOneTimeTokenRepository,
} from "../ports/one-time-token-repository.port"
import { EMAIL_SERVICE, type IEmailService } from "../ports/email-service.port"

export interface RequestEmailVerificationInput {
  userId: string
  ipAddress?: string | null
}

@Injectable()
export class RequestEmailVerificationUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ONE_TIME_TOKEN_REPOSITORY) private readonly tokenRepo: IOneTimeTokenRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
  ) {}

  async executeByEmail(email: string, ipAddress: string | null): Promise<void> {
    const normalized = email.trim().toLowerCase()
    const user = await this.userRepo.findByEmail(normalized)
    // Anti-enumeration: silencia 404 e "already confirmed"
    if (!user || user.isEmailConfirmed) return
    await this.dispatch(user.id, user.email, user.firstName, ipAddress)
  }

  async execute(input: RequestEmailVerificationInput): Promise<void> {
    const user = await this.userRepo.findById(input.userId)
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), { status: 404, code: "USER_NOT_FOUND" })
    }
    if (user.isEmailConfirmed) {
      throw Object.assign(new Error("Email já confirmado"), { status: 409, code: "EMAIL_ALREADY_CONFIRMED" })
    }
    await this.dispatch(user.id, user.email, user.firstName, input.ipAddress ?? null)
  }

  private async dispatch(userId: string, email: string, firstName: string, ipAddress: string | null): Promise<void> {
    await this.tokenRepo.invalidatePending(userId, "EMAIL_VERIFY")

    const rawToken = generateOpaqueToken(32)
    const tokenHash = sha256Hex(rawToken)
    const expiresAt = new Date(Date.now() + authConfig.tokens.emailVerifyTtlSeconds * 1000)

    await this.tokenRepo.create({
      userId,
      tokenHash,
      purpose: "EMAIL_VERIFY",
      expiresAt,
      ipAddress,
    })

    const verifyUrl = `${authConfig.frontendUrl.replace(/\/$/, "")}/auth/verify-callback?token=${encodeURIComponent(rawToken)}`
    await this.emailService.sendVerificationEmail({
      to: email,
      recipientName: firstName || "usuário(a)",
      verifyUrl,
    })
  }
}
