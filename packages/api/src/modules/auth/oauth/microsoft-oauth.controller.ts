import { Controller, Get, Query, Req, Res } from "@nestjs/common"
import type { Request, Response } from "express"
import { randomUUID } from "crypto"
import {
  buildMicrosoftAuthorizationUrl,
  exchangeMicrosoftCodeForProfile,
} from "../infrastructure/oauth/microsoft-oauth.service"
import { HandleOAuthCallbackUseCase } from "../application/use-cases/handle-oauth-callback.use-case"
import { setAuthCookies } from "../../../common/utils/cookies"
import { authConfig } from "../../../config/auth.config"

function resolveMicrosoftConfig(host: string) {
  const { clientId, clientSecret, tenantId } = authConfig.oauth.microsoft
  if (!clientId || !clientSecret) return null
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${host}/auth/oauth/microsoft/callback`
  return { clientId, clientSecret, redirectUri, tenantId }
}

@Controller("auth/oauth/microsoft")
export class MicrosoftOAuthController {
  constructor(private readonly oauthCallback: HandleOAuthCallbackUseCase) {}

  @Get()
  start(@Req() req: Request, @Res() res: Response) {
    const host = `${req.protocol}://${req.get("host")}`
    const config = resolveMicrosoftConfig(host)
    if (!config) {
      res.status(503).json({ data: null, error: { code: "MICROSOFT_OAUTH_NOT_CONFIGURED", message: "Microsoft OAuth não configurado" } })
      return
    }

    const state = randomUUID()
    const authorizationUrl = buildMicrosoftAuthorizationUrl(config, state)
    res.cookie("mmx_oauth_state_microsoft", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 10 * 60 * 1000 })
    res.redirect(authorizationUrl)
  }

  @Get("callback")
  async callback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Req() req: Request & { cookies?: Record<string, string> },
    @Res() res: Response,
  ) {
    const host = `${req.protocol}://${req.get("host")}`
    const config = resolveMicrosoftConfig(host)
    if (!config) {
      res.status(503).json({ data: null, error: { code: "MICROSOFT_OAUTH_NOT_CONFIGURED", message: "Microsoft OAuth não configurado" } })
      return
    }
    if (!code) {
      res.status(400).json({ data: null, error: { code: "OAUTH_CODE_MISSING", message: "Código de autorização ausente" } })
      return
    }
    const expectedState = req.cookies?.["mmx_oauth_state_microsoft"]
    if (!state || !expectedState || state !== expectedState) {
      res.status(401).json({ data: null, error: { code: "OAUTH_STATE_INVALID", message: "Estado OAuth inválido" } })
      return
    }

    try {
      const profile = await exchangeMicrosoftCodeForProfile({ code, config })
      const result = await this.oauthCallback.execute({ ...profile, provider: "microsoft" })
      res.clearCookie("mmx_oauth_state_microsoft", { path: "/" })
      setAuthCookies(res, result.accessToken, result.refreshToken)
      res.json({ data: { accessToken: result.accessToken, refreshToken: result.refreshToken, expiresIn: result.expiresIn, isNewUser: result.isNewUser, user: result.user }, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro no callback OAuth Microsoft"
      res.status(400).json({ data: null, error: { code: "MICROSOFT_OAUTH_CALLBACK_ERROR", message } })
    }
  }
}
