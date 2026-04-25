export interface MicrosoftOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  tenantId: string
}

export interface MicrosoftOAuthProfile {
  email: string
  providerAccountId: string
  givenName?: string
  familyName?: string
  fullName?: string
}

interface ExchangeCodeInput {
  code: string
  config: MicrosoftOAuthConfig
}

interface MicrosoftTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

interface MicrosoftUserResponse {
  id?: string
  mail?: string
  userPrincipalName?: string
  givenName?: string
  surname?: string
  displayName?: string
}

export function buildMicrosoftAuthorizationUrl(
  config: MicrosoftOAuthConfig,
  state: string,
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    response_mode: "query",
    scope: "openid profile email User.Read",
    state,
  })

  return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`
}

export async function exchangeMicrosoftCodeForProfile(
  input: ExchangeCodeInput,
): Promise<MicrosoftOAuthProfile> {
  const tokenParams = new URLSearchParams({
    code: input.code,
    client_id: input.config.clientId,
    client_secret: input.config.clientSecret,
    redirect_uri: input.config.redirectUri,
    grant_type: "authorization_code",
    scope: "openid profile email User.Read",
  })

  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${input.config.tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    },
  )

  const tokenPayload = (await tokenResponse.json()) as MicrosoftTokenResponse

  if (!tokenResponse.ok || !tokenPayload.access_token) {
    const message =
      tokenPayload.error_description ||
      tokenPayload.error ||
      "Falha ao obter token da Microsoft"
    throw new Error(message)
  }

  const profileResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
    },
  })

  const profilePayload = (await profileResponse.json()) as MicrosoftUserResponse
  const email = profilePayload.mail || profilePayload.userPrincipalName

  if (!profileResponse.ok || !email || !profilePayload.id) {
    throw new Error("Falha ao obter perfil da Microsoft")
  }

  return {
    email,
    providerAccountId: profilePayload.id,
    givenName: profilePayload.givenName,
    familyName: profilePayload.surname,
    fullName: profilePayload.displayName,
  }
}
