import { Controller, Get, Query, Req, Res } from "@nestjs/common"
import type { Request, Response } from "express"
import { randomUUID } from "crypto"
import {
  exchangeGoogleCodeForProfile,
  resolveGoogleOAuthConfig,
} from "@mmx/lib/server/services/google-oauth-service"
import { oauthAuthService } from "@mmx/lib/server/services"
import { issueAccessToken, issueRefreshToken } from "@mmx/lib/server/security/jwt"
import { persistRefreshSession } from "@mmx/lib/server/security/refresh-session-store"
import { setAuthCookies } from "../../../common/utils/cookies"

function makeRequestStub(origin: string) {
  return { nextUrl: { origin } } as any
}

@Controller("auth/oauth/google")
export class GoogleOAuthController {
  @Get()
  start(@Req() req: Request, @Res() res: Response) {
    const origin = `${req.protocol}://${req.get("host")}`
    const config = resolveGoogleOAuthConfig(makeRequestStub(origin))

    if (!config) {
      res.status(503).json({ data: null, error: { code: "GOOGLE_OAUTH_NOT_CONFIGURED", message: "Google OAuth nao configurado" } })
      return
    }

    const state = randomUUID()
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account",
    })

    res.cookie("mmx_oauth_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 10 * 60 * 1000 })
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
  }

  @Get("callback")
  async callback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Req() req: Request & { cookies?: Record<string, string> },
    @Res() res: Response,
  ) {
    const origin = `${req.protocol}://${req.get("host")}`
    const config = resolveGoogleOAuthConfig(makeRequestStub(origin))

    if (!config) {
      res.status(503).json({ data: null, error: { code: "GOOGLE_OAUTH_NOT_CONFIGURED", message: "Google OAuth nao configurado" } })
      return
    }

    if (!code) {
      res.status(400).json({ data: null, error: { code: "OAUTH_CODE_MISSING", message: "Codigo de autorizacao ausente" } })
      return
    }

    const expectedState = req.cookies?.["mmx_oauth_state"]
    if (!state || !expectedState || state !== expectedState) {
      res.status(401).json({ data: null, error: { code: "OAUTH_STATE_INVALID", message: "Estado OAuth invalido" } })
      return
    }

    try {
      const profile = await exchangeGoogleCodeForProfile({ code, config })

      if (!profile.emailVerified) {
        res.status(403).json({ data: null, error: { code: "GOOGLE_EMAIL_NOT_VERIFIED", message: "Email do Google nao verificado" } })
        return
      }

      const { user, isNewUser } = await oauthAuthService.loginWithGoogleProfile(profile)
      const accessTokenResult = issueAccessToken({ id: user.id, email: user.email })
      const refreshTokenResult = issueRefreshToken({ id: user.id, email: user.email })
      persistRefreshSession(refreshTokenResult.token, user.id, refreshTokenResult.expiresInSeconds)

      res.clearCookie("mmx_oauth_state", { path: "/" })
      setAuthCookies(res, accessTokenResult.token, refreshTokenResult.token)

      res.json({
        data: {
          accessToken: accessTokenResult.token,
          refreshToken: refreshTokenResult.token,
          expiresIn: accessTokenResult.expiresInSeconds,
          isNewUser,
          user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, planType: user.planType },
        },
        error: null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro no callback OAuth Google"
      res.status(400).json({ data: null, error: { code: "GOOGLE_OAUTH_CALLBACK_ERROR", message } })
    }
  }
}
