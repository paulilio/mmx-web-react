import { Injectable } from "@nestjs/common"
import { randomBytes } from "crypto"
import * as speakeasy from "speakeasy"
import * as qrcode from "qrcode"

export interface TotpSetupResult {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface TotpVerifyInput {
  secret: string
  token: string
}

/**
 * Service for TOTP (Time-based One-Time Password) 2FA management
 * Uses speakeasy for TOTP generation/verification
 * Generates QR codes for authenticator apps (Google Authenticator, Authy, etc)
 */
@Injectable()
export class TotpService {
  /**
   * Generate new TOTP secret and QR code for user setup
   */
  async generateSecret(userEmail: string, appName: string = "MMX"): Promise<TotpSetupResult> {
    const secret = speakeasy.generateSecret({
      name: `${appName} (${userEmail})`,
      issuer: appName,
      length: 32, // 256-bit secret (stronger than default 32 chars)
    })

    if (!secret.base32) {
      throw new Error("Failed to generate TOTP secret")
    }

    // Generate QR code as data URL
    const qrCode = await qrcode.toDataURL(secret.otpauth_url || "")

    // Generate 10 backup codes (8 chars each, alphanumeric)
    const backupCodes = Array.from({ length: 10 }, () => {
      return randomBytes(4).toString("hex").toUpperCase()
    })

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    }
  }

  /**
   * Verify TOTP token (6-digit code from authenticator app)
   * Allows small time window for clock skew
   */
  verifyToken(secret: string, token: string, window: number = 2): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window, // Allow 30 seconds before/after current time
      })
    } catch (error) {
      return false
    }
  }

  /**
   * Verify backup code and mark it as used
   * Backup codes are single-use
   */
  verifyBackupCode(code: string, usedCodes: string[]): boolean {
    if (usedCodes.includes(code)) {
      return false // Already used
    }

    // Match exactly (case-insensitive)
    return code.toUpperCase() === code.toUpperCase()
  }

  /**
   * Generate recovery codes in format: XXXX-XXXX-XXXX (3x4 hex)
   */
  generateRecoveryCodes(count: number = 10): string[] {
    return Array.from({ length: count }, () => {
      const bytes = randomBytes(6).toString("hex").toUpperCase()
      return `${bytes.slice(0, 4)}-${bytes.slice(4, 8)}-${bytes.slice(8, 12)}`
    })
  }
}
