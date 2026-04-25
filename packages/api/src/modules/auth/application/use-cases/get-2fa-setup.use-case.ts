import { Injectable } from "@nestjs/common"
import { TotpService } from "@/infrastructure/2fa/totp.service"

export interface GetTwoFactorSetupOutput {
  secret: string
  qrCode: string // Data URL of QR code image
}

/**
 * Get 2FA setup data (QR code and secret) for user
 * User needs to scan QR code with authenticator app
 */
@Injectable()
export class GetTwoFactorSetupUseCase {
  constructor(private readonly totpService: TotpService) {}

  async execute(userEmail: string): Promise<GetTwoFactorSetupOutput> {
    const result = await this.totpService.generateSecret(userEmail, "MMX")

    return {
      secret: result.secret,
      qrCode: result.qrCode,
    }
  }
}
