import type { NextRequest } from "next/server"
import { verifyAccessToken } from "./jwt"

function extractBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization")
  if (!authorization) {
    return null
  }

  const [scheme, token] = authorization.split(" ")
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null
  }

  return token
}

export function resolveAccessToken(request: NextRequest): string | null {
  const bearerToken = extractBearerToken(request)
  if (bearerToken) {
    return bearerToken
  }

  const cookiesAccessor = (request as unknown as { cookies?: { get?: (name: string) => { value?: string } | undefined } })
    .cookies

  if (!cookiesAccessor?.get) {
    return null
  }

  return cookiesAccessor.get("mmx_access_token")?.value ?? null
}

export function resolveAuthenticatedUserId(request: NextRequest): string | null {
  const token = resolveAccessToken(request)
  if (!token) {
    return null
  }

  try {
    const payload = verifyAccessToken(token)
    return payload.sub
  } catch {
    return null
  }
}
