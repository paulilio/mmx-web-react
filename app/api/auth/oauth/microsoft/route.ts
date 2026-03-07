import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { fail } from "../../../../../lib/server/http/api-response"
import { buildMicrosoftAuthorizationUrl, resolveMicrosoftOAuthConfig } from "../../../../../lib/server/services/microsoft-oauth-service"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const config = resolveMicrosoftOAuthConfig(request)

  if (!config) {
    return fail(503, "MICROSOFT_OAUTH_NOT_CONFIGURED", "Microsoft OAuth nao configurado")
  }

  const state = randomUUID()
  const authorizationUrl = buildMicrosoftAuthorizationUrl(config, state)
  const response = NextResponse.redirect(authorizationUrl)

  response.cookies.set("mmx_oauth_state_microsoft", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  })

  return response
}
