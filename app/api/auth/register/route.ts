import { NextRequest } from "next/server"
import { fail, ok } from "../../../../lib/server/http/api-response"
import { userRepository } from "../../../../lib/server/repositories"
import { applyRateLimit, resolveClientIp } from "../../../../lib/server/security/rate-limit"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const ip = resolveClientIp(request)
  const limitResult = applyRateLimit({
    namespace: "auth:register",
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
      firstName?: string
      lastName?: string
      phone?: string
      cpfCnpj?: string
    }

    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return fail(400, "INVALID_INPUT", "Campos obrigatorios: email, password, firstName, lastName")
    }

    const existing = await userRepository.findByEmail(body.email)
    if (existing) {
      return fail(409, "USER_ALREADY_EXISTS", "Email ja esta em uso")
    }

    const created = await userRepository.create({
      email: body.email,
      passwordHash: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone ?? null,
      cpfCnpj: body.cpfCnpj ?? null,
      planType: "FREE",
    })

    return ok(
      {
        id: created.id,
        email: created.email,
        firstName: created.firstName,
        lastName: created.lastName,
      },
      201,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no registro"
    return fail(400, "AUTH_REGISTER_ERROR", message)
  }
}
