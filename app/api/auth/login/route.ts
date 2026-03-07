import { NextRequest } from "next/server"
import { fail, ok } from "../../../../lib/server/http/api-response"
import { authService } from "../../../../lib/server/services"
import { setAuthCookies } from "../../../../lib/server/security/auth-cookies"
import { issueAccessToken, issueRefreshToken } from "../../../../lib/server/security/jwt"
import { applyRateLimit, resolveClientIp } from "../../../../lib/server/security/rate-limit"
import { persistRefreshSession } from "../../../../lib/server/security/refresh-session-store"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const ip = resolveClientIp(request)
  const limitResult = applyRateLimit({
    namespace: "auth:login",
    key: ip,
    limit: 5,
    windowMs: 60_000,
  })

  if (!limitResult.allowed) {
    return fail(429, "RATE_LIMITED", `Muitas tentativas. Tente novamente em ${limitResult.retryAfterSeconds}s`)
  }

  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }

    if (!body.email || !body.password) {
      return fail(400, "INVALID_INPUT", "Campos obrigatorios: email, password")
    }

    const user = await authService.login({ email: body.email, password: body.password })

    const accessTokenResult = issueAccessToken({
      id: user.id,
      email: user.email,
    })
    const refreshTokenResult = issueRefreshToken({
      id: user.id,
      email: user.email,
    })

    persistRefreshSession(refreshTokenResult.token, user.id, refreshTokenResult.expiresInSeconds)

    const response = ok({
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
    })

    return setAuthCookies(response, accessTokenResult.token, refreshTokenResult.token)
  } catch (error) {
    if (error instanceof Error && error.message === "Credenciais invalidas") {
      return fail(401, "INVALID_CREDENTIALS", error.message)
    }

    const message = error instanceof Error ? error.message : "Erro no login"
    return fail(400, "AUTH_LOGIN_ERROR", message)
  }
}
