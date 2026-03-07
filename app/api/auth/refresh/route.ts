import { NextRequest } from "next/server"
import { fail, ok } from "../../../../lib/server/http/api-response"
import { resolveRefreshTokenFromCookie, setAuthCookies } from "../../../../lib/server/security/auth-cookies"
import { issueAccessToken, issueRefreshToken, verifyRefreshToken } from "../../../../lib/server/security/jwt"
import { applyRateLimit, resolveClientIp } from "../../../../lib/server/security/rate-limit"
import { isRefreshSessionValid, rotateRefreshSession } from "../../../../lib/server/security/refresh-session-store"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const ip = resolveClientIp(request)
  const limitResult = applyRateLimit({
    namespace: "auth:refresh",
    key: ip,
    limit: 10,
    windowMs: 60_000,
  })

  if (!limitResult.allowed) {
    return fail(429, "RATE_LIMITED", `Muitas tentativas. Tente novamente em ${limitResult.retryAfterSeconds}s`)
  }

  try {
    const body = (await request.json()) as {
      refreshToken?: string
    }

    const refreshToken = body.refreshToken ?? resolveRefreshTokenFromCookie(request)

    if (!refreshToken) {
      return fail(400, "INVALID_INPUT", "Campo obrigatorio: refreshToken")
    }

    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      return fail(401, "INVALID_REFRESH_TOKEN", "Refresh token invalido")
    }

    if (!isRefreshSessionValid(refreshToken, payload.sub)) {
      return fail(401, "INVALID_REFRESH_TOKEN", "Refresh token invalido")
    }

    const accessTokenResult = issueAccessToken({ id: payload.sub, email: payload.email })
    const nextRefreshTokenResult = issueRefreshToken({ id: payload.sub, email: payload.email })

    rotateRefreshSession(
      refreshToken,
      nextRefreshTokenResult.token,
      payload.sub,
      nextRefreshTokenResult.expiresInSeconds,
    )

    const response = ok({
      accessToken: accessTokenResult.token,
      refreshToken: nextRefreshTokenResult.token,
      expiresIn: accessTokenResult.expiresInSeconds,
    })

    return setAuthCookies(response, accessTokenResult.token, nextRefreshTokenResult.token)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no refresh"
    return fail(400, "AUTH_REFRESH_ERROR", message)
  }
}
