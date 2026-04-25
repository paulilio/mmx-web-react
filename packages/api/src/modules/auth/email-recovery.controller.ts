import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import type { Request, Response } from "express"
import { VerifyEmailUseCase } from "./application/use-cases/verify-email.use-case"
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.use-case"
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case"
import { setAuthCookies } from "../../common/utils/cookies"
import { extractRequestContext } from "../../common/utils/request-context"
import { authConfig } from "../../config/auth.config"
import { createRateLimitGuard } from "../../common/guards/rate-limit.guard"
import { rateLimitConfig } from "../../config/rate-limit.config"

const VerifyEmailRateLimit = createRateLimitGuard({
  namespace: "auth:verify-email",
  ...rateLimitConfig.auth.verifyEmail,
})
const ForgotPasswordRateLimit = createRateLimitGuard({
  namespace: "auth:forgot-password",
  ...rateLimitConfig.auth.forgotPassword,
})
const ResetPasswordRateLimit = createRateLimitGuard({
  namespace: "auth:reset-password",
  ...rateLimitConfig.auth.resetPassword,
})

@Controller("auth")
export class EmailRecoveryController {
  constructor(
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Get("email/verify")
  @UseGuards(VerifyEmailRateLimit)
  async verifyEmail(
    @Req() req: Request,
    @Query("token") token: string,
    @Res() res: Response,
  ) {
    const ctx = extractRequestContext(req)
    const frontendBase = authConfig.frontendUrl.replace(/\/$/, "")
    try {
      const result = await this.verifyEmailUseCase.execute({
        rawToken: token,
        userAgent: ctx.userAgent,
        ipAddress: ctx.ipAddress,
      })
      setAuthCookies(res, result.accessToken, result.refreshToken)
      res.redirect(`${frontendBase}/auth/verify-callback?status=success`)
    } catch (error) {
      const code = (error as { code?: string }).code ?? "TOKEN_INVALID"
      res.redirect(`${frontendBase}/auth/verify-callback?status=error&code=${encodeURIComponent(code)}`)
    }
  }

  @Post("password/forgot")
  @UseGuards(ForgotPasswordRateLimit)
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Req() req: Request, @Body() body: { email?: string }) {
    if (!body.email) {
      throw Object.assign(new Error("Campo obrigatório: email"), { status: 400, code: "INVALID_INPUT" })
    }
    const ctx = extractRequestContext(req)
    try {
      await this.forgotPasswordUseCase.execute({ email: body.email, ipAddress: ctx.ipAddress })
    } catch (error) {
      const code = (error as { code?: string }).code
      // Apenas erros de validação devem propagar; ausência de usuário fica silenciada (anti-enumeration).
      if (code === "INVALID_INPUT" || code === undefined) {
        throw error
      }
    }
    return { success: true }
  }

  @Post("password/reset")
  @UseGuards(ResetPasswordRateLimit)
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token?: string; newPassword?: string }) {
    if (!body.token || !body.newPassword) {
      throw Object.assign(new Error("Campos obrigatórios: token, newPassword"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }
    await this.resetPasswordUseCase.execute({
      rawToken: body.token,
      newPassword: body.newPassword,
    })
    return { success: true }
  }
}
