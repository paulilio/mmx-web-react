import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { fail } from "../../../../../lib/server/http/api-response"
import { buildGoogleAuthorizationUrl, resolveGoogleOAuthConfig } from "../../../../../lib/server/services/google-oauth-service"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const config = resolveGoogleOAuthConfig(request)

  if (!config) {
    return fail(503, "GOOGLE_OAUTH_NOT_CONFIGURED", "Google OAuth nao configurado")
  }

  const state = randomUUID()
  const authorizationUrl = buildGoogleAuthorizationUrl(config, state)
  const response = NextResponse.redirect(authorizationUrl)

  response.cookies.set("mmx_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  })

  return response
}
