import { randomUUID } from "crypto"
import { NextRequest } from "next/server"
import { fail, ok } from "../../../../lib/server/http/api-response"
import { applyRateLimit, resolveClientIp } from "../../../../lib/server/security/rate-limit"

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

    if (!body.refreshToken) {
      return fail(400, "INVALID_INPUT", "Campo obrigatorio: refreshToken")
    }

    if (!body.refreshToken.startsWith("rt_")) {
      return fail(401, "INVALID_REFRESH_TOKEN", "Refresh token invalido")
    }

    const accessToken = `at_${randomUUID()}`

    return ok({
      accessToken,
      expiresIn: 1800,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no refresh"
    return fail(400, "AUTH_REFRESH_ERROR", message)
  }
}
