import { randomUUID } from "crypto"
import { NextRequest } from "next/server"
import { fail, ok } from "../../../../lib/server/http/api-response"
import { userRepository } from "../../../../lib/server/repositories"
import { setAuthCookies } from "../../../../lib/server/security/auth-cookies"
import { applyRateLimit, resolveClientIp } from "../../../../lib/server/security/rate-limit"

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

    const user = await userRepository.findByEmail(body.email)

    if (!user || !user.passwordHash || user.passwordHash !== body.password) {
      return fail(401, "INVALID_CREDENTIALS", "Credenciais invalidas")
    }

    const accessToken = `at_${randomUUID()}`
    const refreshToken = `rt_${randomUUID()}`

    await userRepository.update(user.id, { lastLogin: new Date() })

    const response = ok({
      accessToken,
      refreshToken,
      expiresIn: 1800,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        planType: user.planType,
      },
    })

    return setAuthCookies(response, accessToken, refreshToken)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no login"
    return fail(400, "AUTH_LOGIN_ERROR", message)
  }
}
