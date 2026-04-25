import { Injectable, Inject } from "@nestjs/common"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import { TotpService } from "@/infrastructure/2fa/totp.service"

export interface VerifyTwoFactorLoginInput {
  userId: string
  totpToken?: string // 6-digit code
  backupCode?: string // Backup code format: XXXX-XXXX-XXXX
}

export interface VerifyTwoFactorLoginOutput {
  success: boolean
  userId: string
}

/**
 * Verify 2FA token or backup code during login
 * Accepts either current TOTP code or backup code
 */
@Injectable()
export class VerifyTwoFactorLoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly totpService: TotpService,
  ) {}

  async execute(input: VerifyTwoFactorLoginInput): Promise<VerifyTwoFactorLoginOutput> {
    const user = await this.userRepo.findById(input.userId)
    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 404, code: "USER_NOT_FOUND" })
    }

    if (!user.totpEnabled || !user.totpSecret) {
      throw Object.assign(new Error("2FA not enabled for this account"), {
        status: 400,
        code: "2FA_NOT_ENABLED",
      })
    }

    let isValid = false

    // Try TOTP token first
    if (input.totpToken) {
      isValid = this.totpService.verifyToken(user.totpSecret, input.totpToken)
    }

    // Try backup code if TOTP failed
    if (!isValid && input.backupCode) {
      const codeUpper = input.backupCode.toUpperCase()

      // Check if code exists and hasn't been used
      if (
        user.totpBackupCodes.includes(codeUpper) &&
        !user.totpBackupCodesUsed.includes(codeUpper)
      ) {
        isValid = true

        // Mark code as used
        const updatedUsedCodes = [...(user.totpBackupCodesUsed || []), codeUpper]
        await this.userRepo.update(user.id, {
          totpBackupCodesUsed: updatedUsedCodes,
        })
      }
    }

    if (!isValid) {
      throw Object.assign(new Error("Invalid 2FA code or backup code"), {
        status: 400,
        code: "INVALID_2FA_CODE",
      })
    }

    return {
      success: true,
      userId: user.id,
    }
  }
}
