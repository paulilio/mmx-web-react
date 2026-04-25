import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import type { Request, Response } from "express"
import { RegisterUseCase } from "./application/use-cases/register.use-case"
import { LoginUseCase } from "./application/use-cases/login.use-case"
import { RefreshSessionUseCase } from "./application/use-cases/refresh-session.use-case"
import { LogoutUseCase } from "./application/use-cases/logout.use-case"
import { setAuthCookies, clearAuthCookies, resolveRefreshTokenFromCookie } from "../../common/utils/cookies"
import { extractRequestContext } from "../../common/utils/request-context"
import { createRateLimitGuard } from "../../common/guards/rate-limit.guard"
import { rateLimitConfig } from "../../config/rate-limit.config"

const LoginRateLimit = createRateLimitGuard({ namespace: "auth:login", ...rateLimitConfig.auth.login })
const RegisterRateLimit = createRateLimitGuard({ namespace: "auth:register", ...rateLimitConfig.auth.register })
const RefreshRateLimit = createRateLimitGuard({ namespace: "auth:refresh", ...rateLimitConfig.auth.refresh })

@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post("register")
  @UseGuards(RegisterRateLimit)
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Req() req: Request,
    @Body() body: {
      email?: string
      password?: string
      firstName?: string
      lastName?: string
      phone?: string
      cpfCnpj?: string
    },
  ) {
    if (!body.email || !body.password || !body.firstName) {
      throw Object.assign(new Error("Campos obrigatórios: email, password, firstName"), {
        status: 400, code: "INVALID_INPUT",
      })
    }
    const ctx = extractRequestContext(req)
    return this.registerUseCase.execute(
      {
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        cpfCnpj: body.cpfCnpj,
      },
      { ipAddress: ctx.ipAddress },
    )
  }

  @Post("login")
  @UseGuards(LoginRateLimit)
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Body() body: { email?: string; password?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body.email || !body.password) {
      throw Object.assign(new Error("Campos obrigatórios: email, password"), { status: 400, code: "INVALID_INPUT" })
    }
    const ctx = extractRequestContext(req)
    const result = await this.loginUseCase.execute(
      { email: body.email, password: body.password },
      { userAgent: ctx.userAgent, ipAddress: ctx.ipAddress },
    )
    setAuthCookies(res, result.accessToken, result.refreshToken)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      user: result.user,
    }
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request & { cookies?: Record<string, string> },
    @Res({ passthrough: true }) res: Response,
    @Body() body: { refreshToken?: string },
  ) {
    const token = body.refreshToken ?? resolveRefreshTokenFromCookie(req)
    await this.logoutUseCase.execute(token ?? null)
    clearAuthCookies(res)
    return { success: true }
  }

  @Post("refresh")
  @UseGuards(RefreshRateLimit)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request & { cookies?: Record<string, string> },
    @Res({ passthrough: true }) res: Response,
    @Body() body: { refreshToken?: string },
  ) {
    const token = body.refreshToken ?? resolveRefreshTokenFromCookie(req)
    if (!token) {
      throw Object.assign(new Error("Campo obrigatório: refreshToken"), { status: 400, code: "INVALID_INPUT" })
    }
    const ctx = extractRequestContext(req)
    const result = await this.refreshSessionUseCase.execute(token, {
      userAgent: ctx.userAgent,
      ipAddress: ctx.ipAddress,
    })
    setAuthCookies(res, result.accessToken, result.refreshToken)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    }
  }
}
