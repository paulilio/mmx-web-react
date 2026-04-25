import { Injectable, Inject } from "@nestjs/common"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import { TotpService } from "@/infrastructure/2fa/totp.service"

export interface EnableTwoFactorInput {
  secret: string
  token: string // 6-digit code from authenticator
}

export interface EnableTwoFactorOutput {
  success: boolean
  backupCodes: string[]
  enabledAt: string
}

/**
 * Enable 2FA for user account
 * Requires valid TOTP token from authenticator app
 */
@Injectable()
export class EnableTwoFactorUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly totpService: TotpService,
  ) {}

  async execute(userId: string, input: EnableTwoFactorInput): Promise<EnableTwoFactorOutput> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 404, code: "USER_NOT_FOUND" })
    }

    if (user.totpEnabled) {
      throw Object.assign(new Error("2FA already enabled"), {
        status: 409,
        code: "2FA_ALREADY_ENABLED",
      })
    }

    // Verify TOTP token
    const isValid = this.totpService.verifyToken(input.secret, input.token)
    if (!isValid) {
      throw Object.assign(new Error("Invalid authenticator code"), {
        status: 400,
        code: "INVALID_TOTP_TOKEN",
      })
    }

    // Generate backup codes
    const backupCodes = this.totpService.generateRecoveryCodes(10)

    // Store in database
    await this.userRepo.update(userId, {
      totpEnabled: true,
      totpSecret: input.secret,
      totpBackupCodes: backupCodes,
      totpBackupCodesUsed: [],
      totpEnabledAt: new Date(),
    })

    return {
      success: true,
      backupCodes,
      enabledAt: new Date().toISOString(),
    }
  }
}
