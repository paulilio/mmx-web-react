import { NextRequest } from "next/server"
import { fail, ok } from "../../../../../../lib/server/http/api-response"
import { oauthAuthService } from "@/lib/server/services"
import { setAuthCookies } from "../../../../../../lib/server/security/auth-cookies"
import { issueAccessToken, issueRefreshToken } from "../../../../../../lib/server/security/jwt"
import { persistRefreshSession } from "../../../../../../lib/server/security/refresh-session-store"
import { exchangeGoogleCodeForProfile, resolveGoogleOAuthConfig } from "../../../../../../lib/server/services/google-oauth-service"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const config = resolveGoogleOAuthConfig(request)

  if (!config) {
    return fail(503, "GOOGLE_OAUTH_NOT_CONFIGURED", "Google OAuth nao configurado")
  }

  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const expectedState = request.cookies.get("mmx_oauth_state")?.value

  if (!code) {
    return fail(400, "OAUTH_CODE_MISSING", "Codigo de autorizacao ausente")
  }

  if (!state || !expectedState || state !== expectedState) {
    return fail(401, "OAUTH_STATE_INVALID", "Estado OAuth invalido")
  }

  try {
    const profile = await exchangeGoogleCodeForProfile({ code, config })

    if (!profile.emailVerified) {
      return fail(403, "GOOGLE_EMAIL_NOT_VERIFIED", "Email do Google nao verificado")
    }

      const { user, isNewUser } = await oauthAuthService.loginWithGoogleProfile(profile)

      const accessTokenResult = issueAccessToken({ id: user.id, email: user.email })
      const refreshTokenResult = issueRefreshToken({ id: user.id, email: user.email })
      persistRefreshSession(refreshTokenResult.token, user.id, refreshTokenResult.expiresInSeconds)

    const response = ok({
      accessToken: accessTokenResult.token,
      refreshToken: refreshTokenResult.token,
      expiresIn: accessTokenResult.expiresInSeconds,
        isNewUser,
      user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          planType: user.planType,
      },
    })

    response.cookies.delete("mmx_oauth_state")
    return setAuthCookies(response, accessTokenResult.token, refreshTokenResult.token)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no callback OAuth Google"
    return fail(400, "GOOGLE_OAUTH_CALLBACK_ERROR", message)
  }
}
