import { NextRequest } from "next/server"
import { ok } from "../../../../lib/server/http/api-response"
import { clearAuthCookies, resolveRefreshTokenFromCookie } from "../../../../lib/server/security/auth-cookies"
import { revokeRefreshSession } from "../../../../lib/server/security/refresh-session-store"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  let refreshTokenFromBody: string | undefined

  try {
    const body = (await request.json()) as { refreshToken?: string }
    refreshTokenFromBody = body.refreshToken
  } catch {
    refreshTokenFromBody = undefined
  }

  const refreshToken = refreshTokenFromBody ?? resolveRefreshTokenFromCookie(request)
  if (refreshToken) {
    revokeRefreshSession(refreshToken)
  }

  const response = ok({
    success: true,
  })

  return clearAuthCookies(response)
}
