import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import type { Request, Response } from "express"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { GetCurrentUserUseCase } from "./application/use-cases/get-current-user.use-case"
import { LogoutAllUseCase } from "./application/use-cases/logout-all.use-case"
import { RequestEmailVerificationUseCase } from "./application/use-cases/request-email-verification.use-case"
import { extractRequestContext } from "../../common/utils/request-context"
import { clearAuthCookies } from "../../common/utils/cookies"
import { createRateLimitGuard } from "../../common/guards/rate-limit.guard"
import { rateLimitConfig } from "../../config/rate-limit.config"

const RequestVerificationRateLimit = createRateLimitGuard({
  namespace: "auth:request-verification",
  ...rateLimitConfig.auth.requestVerification,
})

@Controller("auth")
export class MeController {
  constructor(
    private readonly getCurrentUser: GetCurrentUserUseCase,
    private readonly logoutAll: LogoutAllUseCase,
    private readonly requestEmailVerification: RequestEmailVerificationUseCase,
  ) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request & { userId?: string }) {
    const userId = req.userId
    if (!userId) {
      throw Object.assign(new Error("Autenticação obrigatória"), { status: 401, code: "AUTH_REQUIRED" })
    }
    return this.getCurrentUser.execute(userId)
  }

  @Post("logout-all")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAllDevices(
    @Req() req: Request & { userId?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.userId
    if (!userId) {
      throw Object.assign(new Error("Autenticação obrigatória"), { status: 401, code: "AUTH_REQUIRED" })
    }
    const result = await this.logoutAll.execute(userId)
    clearAuthCookies(res)
    return result
  }

  @Post("email/request-verification")
  @UseGuards(JwtAuthGuard, RequestVerificationRateLimit)
  @HttpCode(HttpStatus.OK)
  async requestVerification(@Req() req: Request & { userId?: string }) {
    const userId = req.userId
    if (!userId) {
      throw Object.assign(new Error("Autenticação obrigatória"), { status: 401, code: "AUTH_REQUIRED" })
    }
    const ctx = extractRequestContext(req)
    await this.requestEmailVerification.execute({ userId, ipAddress: ctx.ipAddress })
    return { success: true }
  }
}
