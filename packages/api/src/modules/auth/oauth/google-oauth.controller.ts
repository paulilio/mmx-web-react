import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common"
import type { Request, Response } from "express"
import { randomUUID } from "crypto"
import { exchangeGoogleCodeForProfile } from "../infrastructure/oauth/google-oauth.service"
import { HandleOAuthCallbackUseCase } from "../application/use-cases/handle-oauth-callback.use-case"
import { setAuthCookies } from "../../../common/utils/cookies"
import { extractRequestContext } from "../../../common/utils/request-context"
import { authConfig } from "../../../config/auth.config"
import { createRateLimitGuard } from "../../../common/guards/rate-limit.guard"
import { rateLimitConfig } from "../../../config/rate-limit.config"

const OAuthStartRateLimit = createRateLimitGuard({
  namespace: "auth:oauth-start:google",
  ...rateLimitConfig.auth.oauthStart,
})
const OAuthCallbackRateLimit = createRateLimitGuard({
  namespace: "auth:oauth-callback:google",
  ...rateLimitConfig.auth.oauthCallback,
})

function resolveGoogleConfig(host: string) {
  const { clientId, clientSecret } = authConfig.oauth.google
  if (!clientId || !clientSecret) return null
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${host}/auth/oauth/google/callback`
  return { clientId, clientSecret, redirectUri }
}

function frontendRedirect(path: string, query: Record<string, string>): string {
  const base = authConfig.frontendUrl.replace(/\/$/, "")
  const params = new URLSearchParams(query).toString()
  return `${base}${path}${params ? `?${params}` : ""}`
}

@Controller("auth/oauth/google")
export class GoogleOAuthController {
  constructor(private readonly oauthCallback: HandleOAuthCallbackUseCase) {}

  @Get()
  @UseGuards(OAuthStartRateLimit)
  start(@Req() req: Request, @Res() res: Response) {
    const host = `${req.protocol}://${req.get("host")}`
    const config = resolveGoogleConfig(host)
    if (!config) {
      res.redirect(frontendRedirect("/auth/oauth-callback", { provider: "google", status: "error", code: "GOOGLE_OAUTH_NOT_CONFIGURED" }))
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

    const cookieSameSite = (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax"
    res.cookie("mmx_oauth_state", state, {
      httpOnly: true,
      sameSite: cookieSameSite,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60 * 1000,
    })
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
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
    const config = resolveGoogleConfig(host)
    if (!config) {
      res.redirect(frontendRedirect("/auth/oauth-callback", { provider: "google", status: "error", code: "GOOGLE_OAUTH_NOT_CONFIGURED" }))
      return
    }
    if (!code) {
      res.redirect(frontendRedirect("/auth/oauth-callback", { provider: "google", status: "error", code: "OAUTH_CODE_MISSING" }))
      return
    }
    const expectedState = req.cookies?.["mmx_oauth_state"]
    if (!state || !expectedState || state !== expectedState) {
      res.redirect(frontendRedirect("/auth/oauth-callback", { provider: "google", status: "error", code: "OAUTH_STATE_INVALID" }))
      return
    }

    try {
      const profile = await exchangeGoogleCodeForProfile({ code, config })
      if (!profile.emailVerified) {
        res.redirect(frontendRedirect("/auth/oauth-callback", { provider: "google", status: "error", code: "GOOGLE_EMAIL_NOT_VERIFIED" }))
        return
      }
      const ctx = extractRequestContext(req)
      const result = await this.oauthCallback.execute(
        { ...profile, provider: "google" },
        { userAgent: ctx.userAgent, ipAddress: ctx.ipAddress },
      )
      const sameSite = (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax"
      res.clearCookie("mmx_oauth_state", { path: "/", sameSite, secure: process.env.NODE_ENV === "production" })
      setAuthCookies(res, result.accessToken, result.refreshToken)
      res.redirect(frontendRedirect("/auth/oauth-callback", {
        provider: "google",
        status: "success",
        isNewUser: result.isNewUser ? "1" : "0",
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro no callback OAuth Google"
      res.redirect(frontendRedirect("/auth/oauth-callback", {
        provider: "google",
        status: "error",
        code: "GOOGLE_OAUTH_CALLBACK_ERROR",
        message: message.slice(0, 200),
      }))
    }
  }
}
