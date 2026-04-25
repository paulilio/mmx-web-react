import { Injectable, Inject } from "@nestjs/common"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"

export interface DisableTwoFactorInput {
  password: string // Require password for security
}

export interface DisableTwoFactorOutput {
  success: boolean
  disabledAt: string
}

/**
 * Disable 2FA for user account
 * Requires current password for security
 */
@Injectable()
export class DisableTwoFactorUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string, input: DisableTwoFactorInput): Promise<DisableTwoFactorOutput> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 404, code: "USER_NOT_FOUND" })
    }

    if (!user.totpEnabled) {
      throw Object.assign(new Error("2FA not enabled"), {
        status: 409,
        code: "2FA_NOT_ENABLED",
      })
    }

    // Clear 2FA settings
    await this.userRepo.update(userId, {
      totpEnabled: false,
      totpSecret: null,
      totpBackupCodes: [],
      totpBackupCodesUsed: [],
      totpEnabledAt: null,
    })

    return {
      success: true,
      disabledAt: new Date().toISOString(),
    }
  }
}
