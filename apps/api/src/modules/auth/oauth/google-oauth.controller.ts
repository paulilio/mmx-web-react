import { Controller, Get, Query, Req, Res } from "@nestjs/common"
import type { Request, Response } from "express"
import { randomUUID } from "crypto"
import { exchangeGoogleCodeForProfile } from "../infrastructure/oauth/google-oauth.service"
import { HandleOAuthCallbackUseCase } from "../application/use-cases/handle-oauth-callback.use-case"
import { setAuthCookies } from "../../../common/utils/cookies"
import { authConfig } from "../../../config/auth.config"

function resolveGoogleConfig(host: string) {
  const { clientId, clientSecret } = authConfig.oauth.google
  if (!clientId || !clientSecret) return null
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${host}/auth/oauth/google/callback`
  return { clientId, clientSecret, redirectUri }
}

@Controller("auth/oauth/google")
export class GoogleOAuthController {
  constructor(private readonly oauthCallback: HandleOAuthCallbackUseCase) {}

  @Get()
  start(@Req() req: Request, @Res() res: Response) {
    const host = `${req.protocol}://${req.get("host")}`
    const config = resolveGoogleConfig(host)
    if (!config) {
      res.status(503).json({ data: null, error: { code: "GOOGLE_OAUTH_NOT_CONFIGURED", message: "Google OAuth não configurado" } })
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
    const host = `${req.protocol}://${req.get("host")}`
    const config = resolveGoogleConfig(host)
    if (!config) {
      res.status(503).json({ data: null, error: { code: "GOOGLE_OAUTH_NOT_CONFIGURED", message: "Google OAuth não configurado" } })
      return
    }
    if (!code) {
      res.status(400).json({ data: null, error: { code: "OAUTH_CODE_MISSING", message: "Código de autorização ausente" } })
      return
    }
    const expectedState = req.cookies?.["mmx_oauth_state"]
    if (!state || !expectedState || state !== expectedState) {
      res.status(401).json({ data: null, error: { code: "OAUTH_STATE_INVALID", message: "Estado OAuth inválido" } })
      return
    }

    try {
      const profile = await exchangeGoogleCodeForProfile({ code, config })
      if (!profile.emailVerified) {
        res.status(403).json({ data: null, error: { code: "GOOGLE_EMAIL_NOT_VERIFIED", message: "Email do Google não verificado" } })
        return
      }
      const result = await this.oauthCallback.execute({ ...profile, provider: "google" })
      res.clearCookie("mmx_oauth_state", { path: "/" })
      setAuthCookies(res, result.accessToken, result.refreshToken)
      res.json({ data: { accessToken: result.accessToken, refreshToken: result.refreshToken, expiresIn: result.expiresIn, isNewUser: result.isNewUser, user: result.user }, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro no callback OAuth Google"
      res.status(400).json({ data: null, error: { code: "GOOGLE_OAUTH_CALLBACK_ERROR", message } })
    }
  }
}
