import { Controller, Get, Post, Delete, Body, Req, UseGuards, HttpCode, HttpStatus } from "@nestjs/common"
import type { Request } from "express"
import { GetTwoFactorSetupUseCase } from "./application/use-cases/get-2fa-setup.use-case"
import { EnableTwoFactorUseCase } from "./application/use-cases/enable-2fa.use-case"
import { DisableTwoFactorUseCase } from "./application/use-cases/disable-2fa.use-case"
import { VerifyTwoFactorLoginUseCase } from "./application/use-cases/verify-2fa-login.use-case"
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard"

@Controller("auth/2fa")
export class TwoFactorController {
  constructor(
    private readonly getTwoFactorSetupUseCase: GetTwoFactorSetupUseCase,
    private readonly enableTwoFactorUseCase: EnableTwoFactorUseCase,
    private readonly disableTwoFactorUseCase: DisableTwoFactorUseCase,
    private readonly verifyTwoFactorLoginUseCase: VerifyTwoFactorLoginUseCase,
  ) {}

  /**
   * GET /auth/2fa/setup
   * Get QR code and secret for setting up 2FA
   * Requires authentication
   */
  @Get("setup")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSetup(@Req() req: Request & { userId?: string }) {
    const userId = req.userId
    if (!userId) {
      throw Object.assign(new Error("User not authenticated"), {
        status: 401,
        code: "UNAUTHORIZED",
      })
    }

    // Get user email from context (would need to pass from JWT)
    // For now, we'll use a placeholder - in real code, extract from JWT payload
    const email = (req as any).userEmail || "user@example.com"

    return this.getTwoFactorSetupUseCase.execute(email)
  }

  /**
   * POST /auth/2fa/setup
   * Enable 2FA after verifying TOTP code
   * Requires authentication
   */
  @Post("setup")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async enableTwoFactor(
    @Req() req: Request & { userId?: string },
    @Body() body: { secret?: string; token?: string },
  ) {
    if (!body.secret || !body.token) {
      throw Object.assign(new Error("Missing required fields: secret, token"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }

    const userId = req.userId
    if (!userId) {
      throw Object.assign(new Error("User not authenticated"), {
        status: 401,
        code: "UNAUTHORIZED",
      })
    }

    return this.enableTwoFactorUseCase.execute(userId, {
      secret: body.secret,
      token: body.token,
    })
  }

  /**
   * DELETE /auth/2fa
   * Disable 2FA for current user
   * Requires authentication
   */
  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disableTwoFactor(@Req() req: Request & { userId?: string }) {
    const userId = req.userId
    if (!userId) {
      throw Object.assign(new Error("User not authenticated"), {
        status: 401,
        code: "UNAUTHORIZED",
      })
    }

    return this.disableTwoFactorUseCase.execute(userId, { password: "" })
  }

  /**
   * POST /auth/2fa/verify-login
   * Verify 2FA during login (public endpoint)
   */
  @Post("verify-login")
  @HttpCode(HttpStatus.OK)
  async verifyLogin(
    @Body()
    body: {
      userId?: string
      totpToken?: string
      backupCode?: string
    },
  ) {
    if (!body.userId) {
      throw Object.assign(new Error("User ID required"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }

    if (!body.totpToken && !body.backupCode) {
      throw Object.assign(new Error("TOTP token or backup code required"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }

    return this.verifyTwoFactorLoginUseCase.execute({
      userId: body.userId,
      totpToken: body.totpToken,
      backupCode: body.backupCode,
    })
  }
}
