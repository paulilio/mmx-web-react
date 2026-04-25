import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common"
import type { Request, Response } from "express"
import { randomUUID } from "crypto"
import {
  buildMicrosoftAuthorizationUrl,
  exchangeMicrosoftCodeForProfile,
} from "../infrastructure/oauth/microsoft-oauth.service"
import { HandleOAuthCallbackUseCase } from "../application/use-cases/handle-oauth-callback.use-case"
import { setAuthCookies } from "../../../common/utils/cookies"
import { extractRequestContext } from "../../../common/utils/request-context"
import { authConfig } from "../../../config/auth.config"
import { createRateLimitGuard } from "../../../common/guards/rate-limit.guard"
import { rateLimitConfig } from "../../../config/rate-limit.config"

const OAuthStartRateLimit = createRateLimitGuard({
  namespace: "auth:oauth-start:microsoft",
  ...rateLimitConfig.auth.oauthStart,
})
const OAuthCallbackRateLimit = createRateLimitGuard({
  namespace: "auth:oauth-callback:microsoft",
  ...rateLimitConfig.auth.oauthCallback,
})

function resolveMicrosoftConfig(host: string) {
  const { clientId, clientSecret, tenantId } = authConfig.oauth.microsoft
  if (!clientId || !clientSecret) return null
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${host}/auth/oauth/microsoft/callback`
  return { clientId, clientSecret, redirectUri, tenantId }
}

function frontendRedirect(path: string, query: Record<string, string>): string {
  const base = authConfig.frontendUrl.replace(/\/$/, "")
  const params = new URLSearchParams(query).toString()
  return `${base}${path}${params ? `?${params}` : ""}`
}

@Controller("auth/oauth/microsoft")
export class MicrosoftOAuthController {
  constructor(private readonly oauthCallback: HandleOAuthCallbackUseCase) {}

  @Get()
  @UseGuards(OAuthStartRateLimit)
  start(@Req() req: Request, @Res() res: Response) {
    const host = `${req.protocol}://${req.get("host")}`
    const config = resolveMicrosoftConfig(host)
    if (!config) {
      res.redirect(frontendRedirect("/auth/oauth-callback", { provider: "microsoft", status: "error", code: "MICROSOFT_OAUTH_NOT_CONFIGURED" }))
      return
    }

    const state = randomUUID()
    const authorizationUrl = buildMicrosoftAuthorizationUrl(config, state)
    const cookieSameSite = (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax"
    res.cookie("mmx_oauth_state_microsoft", state, {
      httpOnly: true,
      sameSite: cookieSameSite,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60 * 1000,
    })
    res.redirect(authorizationUrl)
  }

  @Get("callback")
  @UseGuards(OAuthCallbackRateLimit)
  async callback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Req() req: Request & { cookies?: Record<string, string> },
    @Res() res: Response,
  ) {
    const host = `${req.protocol}://${req.get("host")}`
    const config = resolveMicrosoftConfig(host)
    if (!config) {
      res.redirect(frontendRedirect("/auth/oauth-callback", { provider: "microsoft", status: "error", code: "MICROSOFT_OAUTH_NOT_CONFIGURED" }))
      return
    }
    if (!code) {
      res.redirect(frontendRedirect("/auth/oauth-callback", { provider: "microsoft", status: "error", code: "OAUTH_CODE_MISSING" }))
      return
    }
    const expectedState = req.cookies?.["mmx_oauth_state_microsoft"]
    if (!state || !expectedState || state !== expectedState) {
      res.redirect(frontendRedirect("/auth/oauth-callback", { provider: "microsoft", status: "error", code: "OAUTH_STATE_INVALID" }))
      return
    }

    try {
      const profile = await exchangeMicrosoftCodeForProfile({ code, config })
      const ctx = extractRequestContext(req)
      const result = await this.oauthCallback.execute(
        { ...profile, provider: "microsoft" },
        { userAgent: ctx.userAgent, ipAddress: ctx.ipAddress },
      )
      const sameSite = (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax"
      res.clearCookie("mmx_oauth_state_microsoft", { path: "/", sameSite, secure: process.env.NODE_ENV === "production" })
      setAuthCookies(res, result.accessToken, result.refreshToken)
      res.redirect(frontendRedirect("/auth/oauth-callback", {
        provider: "microsoft",
        status: "success",
        isNewUser: result.isNewUser ? "1" : "0",
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro no callback OAuth Microsoft"
      res.redirect(frontendRedirect("/auth/oauth-callback", {
        provider: "microsoft",
        status: "error",
        code: "MICROSOFT_OAUTH_CALLBACK_ERROR",
        message: message.slice(0, 200),
      }))
    }
  }
}
