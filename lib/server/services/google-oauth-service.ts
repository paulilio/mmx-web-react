import type { NextRequest } from "next/server"

export interface GoogleOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface GoogleOAuthProfile {
  email: string
  emailVerified: boolean
  givenName?: string
  familyName?: string
  fullName?: string
  picture?: string
}

interface ExchangeCodeInput {
  code: string
  config: GoogleOAuthConfig
}

interface GoogleTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

interface GoogleUserInfoResponse {
  email?: string
  email_verified?: boolean
  given_name?: string
  family_name?: string
  name?: string
  picture?: string
}

export function resolveGoogleOAuthConfig(request: NextRequest): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return null
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/oauth/google/callback`

  return {
    clientId,
    clientSecret,
    redirectUri,
  }
}

export function buildGoogleAuthorizationUrl(config: GoogleOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeGoogleCodeForProfile(input: ExchangeCodeInput): Promise<GoogleOAuthProfile> {
  const tokenParams = new URLSearchParams({
    code: input.code,
    client_id: input.config.clientId,
    client_secret: input.config.clientSecret,
    redirect_uri: input.config.redirectUri,
    grant_type: "authorization_code",
  })

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenParams.toString(),
  })

  const tokenPayload = (await tokenResponse.json()) as GoogleTokenResponse

  if (!tokenResponse.ok || !tokenPayload.access_token) {
    const message = tokenPayload.error_description || tokenPayload.error || "Falha ao obter token do Google"
    throw new Error(message)
  }

  const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
    },
  })

  const userInfo = (await userInfoResponse.json()) as GoogleUserInfoResponse

  if (!userInfoResponse.ok || !userInfo.email) {
    throw new Error("Falha ao obter perfil do Google")
  }

  return {
    email: userInfo.email,
    emailVerified: Boolean(userInfo.email_verified),
    givenName: userInfo.given_name,
    familyName: userInfo.family_name,
    fullName: userInfo.name,
    picture: userInfo.picture,
  }
}
