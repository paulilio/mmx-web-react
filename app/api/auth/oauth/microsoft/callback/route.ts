import { NextRequest } from "next/server"
import { fail, ok } from "../../../../../../lib/server/http/api-response"
import { oauthAuthService } from "@/lib/server/services"
import { setAuthCookies } from "../../../../../../lib/server/security/auth-cookies"
import { issueAccessToken, issueRefreshToken } from "../../../../../../lib/server/security/jwt"
import { persistRefreshSession } from "../../../../../../lib/server/security/refresh-session-store"
import { exchangeMicrosoftCodeForProfile, resolveMicrosoftOAuthConfig } from "../../../../../../lib/server/services/microsoft-oauth-service"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const config = resolveMicrosoftOAuthConfig(request)

  if (!config) {
    return fail(503, "MICROSOFT_OAUTH_NOT_CONFIGURED", "Microsoft OAuth nao configurado")
  }

  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const expectedState = request.cookies.get("mmx_oauth_state_microsoft")?.value

  if (!code) {
    return fail(400, "OAUTH_CODE_MISSING", "Codigo de autorizacao ausente")
  }

  if (!state || !expectedState || state !== expectedState) {
    return fail(401, "OAUTH_STATE_INVALID", "Estado OAuth invalido")
  }

  try {
    const profile = await exchangeMicrosoftCodeForProfile({ code, config })

      const { user, isNewUser } = await oauthAuthService.loginWithMicrosoftProfile(profile)

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

    response.cookies.delete("mmx_oauth_state_microsoft")
    return setAuthCookies(response, accessTokenResult.token, refreshTokenResult.token)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no callback OAuth Microsoft"
    return fail(400, "MICROSOFT_OAUTH_CALLBACK_ERROR", message)
  }
}
