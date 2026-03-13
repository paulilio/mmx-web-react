import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Redirect,
} from "@nestjs/common"
import type { Request, Response } from "express"
import { authService } from "@mmx/lib/server/services"
import {
  issueAccessToken,
  issueRefreshToken,
} from "@mmx/lib/server/security/jwt"
import {
  verifyRefreshToken,
} from "@mmx/lib/server/security/jwt"
import {
  isRefreshSessionValid,
  rotateRefreshSession,
  persistRefreshSession,
  revokeRefreshSession,
} from "@mmx/lib/server/security/refresh-session-store"
import { setAuthCookies, clearAuthCookies, resolveRefreshTokenFromCookie } from "../../common/utils/cookies"
import { createRateLimitGuard } from "../../common/guards/rate-limit.guard"

const LoginRateLimit = createRateLimitGuard({ namespace: "auth:login", limit: 5, windowMs: 60_000 })
const RegisterRateLimit = createRateLimitGuard({ namespace: "auth:register", limit: 5, windowMs: 60_000 })
const RefreshRateLimit = createRateLimitGuard({ namespace: "auth:refresh", limit: 10, windowMs: 60_000 })

@Controller("auth")
export class AuthController {
  // POST /auth/register
  @Post("register")
  @UseGuards(RegisterRateLimit)
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: {
      email?: string
      password?: string
      firstName?: string
      lastName?: string
      phone?: string
      cpfCnpj?: string
    },
  ) {
    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      throw Object.assign(new Error("Campos obrigatorios: email, password, firstName, lastName"), {
        status: 400, code: "INVALID_INPUT",
      })
    }

    const created = await authService.register({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      cpfCnpj: body.cpfCnpj,
    })

    return { id: created.id, email: created.email, firstName: created.firstName, lastName: created.lastName }
  }

  // POST /auth/login
  @Post("login")
  @UseGuards(LoginRateLimit)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email?: string; password?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body.email || !body.password) {
      throw Object.assign(new Error("Campos obrigatorios: email, password"), { status: 400, code: "INVALID_INPUT" })
    }

    const user = await authService.login({ email: body.email, password: body.password })

    const accessTokenResult = issueAccessToken({ id: user.id, email: user.email })
    const refreshTokenResult = issueRefreshToken({ id: user.id, email: user.email })

    persistRefreshSession(refreshTokenResult.token, user.id, refreshTokenResult.expiresInSeconds)
    setAuthCookies(res, accessTokenResult.token, refreshTokenResult.token)

    return {
      accessToken: accessTokenResult.token,
      refreshToken: refreshTokenResult.token,
      expiresIn: accessTokenResult.expiresInSeconds,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        planType: user.planType,
      },
    }
  }

  // POST /auth/logout
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() body: { refreshToken?: string }) {
    const refreshToken = body.refreshToken ?? resolveRefreshTokenFromCookie(req as Request & { cookies?: Record<string, string> })
    if (refreshToken) {
      revokeRefreshSession(refreshToken)
    }
    clearAuthCookies(res)
    return { success: true }
  }

  // POST /auth/refresh
  @Post("refresh")
  @UseGuards(RefreshRateLimit)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { refreshToken?: string },
  ) {
    const refreshToken = body.refreshToken ?? resolveRefreshTokenFromCookie(req as Request & { cookies?: Record<string, string> })

    if (!refreshToken) {
      throw Object.assign(new Error("Campo obrigatorio: refreshToken"), { status: 400, code: "INVALID_INPUT" })
    }

    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw Object.assign(new Error("Refresh token invalido"), { status: 401, code: "INVALID_REFRESH_TOKEN" })
    }

    if (!isRefreshSessionValid(refreshToken, payload.sub)) {
      throw Object.assign(new Error("Refresh token invalido"), { status: 401, code: "INVALID_REFRESH_TOKEN" })
    }

    const accessTokenResult = issueAccessToken({ id: payload.sub, email: payload.email })
    const nextRefreshTokenResult = issueRefreshToken({ id: payload.sub, email: payload.email })

    rotateRefreshSession(refreshToken, nextRefreshTokenResult.token, payload.sub, nextRefreshTokenResult.expiresInSeconds)
    setAuthCookies(res, accessTokenResult.token, nextRefreshTokenResult.token)

    return {
      accessToken: accessTokenResult.token,
      refreshToken: nextRefreshTokenResult.token,
      expiresIn: accessTokenResult.expiresInSeconds,
    }
  }
}
