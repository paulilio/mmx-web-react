import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { oauthAuthServiceMock, googleOAuthServiceMock } = vi.hoisted(() => ({
  oauthAuthServiceMock: {
    loginWithGoogleProfile: vi.fn(),
  },
  googleOAuthServiceMock: {
    resolveGoogleOAuthConfig: vi.fn(),
    exchangeGoogleCodeForProfile: vi.fn(),
  },
}))

vi.mock("@/lib/server/services", () => ({
  oauthAuthService: oauthAuthServiceMock,
}))

vi.mock("../../../../../../lib/server/services/google-oauth-service", () => googleOAuthServiceMock)

import { GET } from "./route"

function makeRequest(url: string, stateCookie = "state-1") {
  return {
    nextUrl: new URL(url),
    cookies: {
      get: vi.fn().mockReturnValue(stateCookie ? { value: stateCookie } : undefined),
    },
  }
}

describe("/api/auth/oauth/google/callback", () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID
  const originalClientSecret = process.env.GOOGLE_CLIENT_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_CLIENT_ID = "google-client-id"
    process.env.GOOGLE_CLIENT_SECRET = "google-client-secret"

    googleOAuthServiceMock.resolveGoogleOAuthConfig.mockReturnValue({
      clientId: "google-client-id",
      clientSecret: "google-client-secret",
      redirectUri: "http://localhost:3000/api/auth/oauth/google/callback",
    })
  })

  afterEach(() => {
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID
    else process.env.GOOGLE_CLIENT_ID = originalClientId

    if (originalClientSecret === undefined) delete process.env.GOOGLE_CLIENT_SECRET
    else process.env.GOOGLE_CLIENT_SECRET = originalClientSecret
  })

  it("retorna 401 quando state e invalido", async () => {
    const request = makeRequest("http://localhost:3000/api/auth/oauth/google/callback?code=abc&state=outro", "state-1")

    const response = await GET(request as never)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("OAUTH_STATE_INVALID")
  })

  it("cria usuario quando email nao existe", async () => {
    googleOAuthServiceMock.exchangeGoogleCodeForProfile.mockResolvedValueOnce({
      email: "novo@mmx.com",
      emailVerified: true,
      givenName: "Novo",
      familyName: "Usuario",
      picture: "https://img.test/u.png",
    })

      oauthAuthServiceMock.loginWithGoogleProfile.mockResolvedValueOnce({
        isNewUser: true,
        user: {
          id: "u1",
          email: "novo@mmx.com",
          firstName: "Novo",
          lastName: "Usuario",
          planType: "FREE",
        },
    })

    const request = makeRequest("http://localhost:3000/api/auth/oauth/google/callback?code=abc&state=state-1")
    const response = await GET(request as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.isNewUser).toBe(true)
      expect(oauthAuthServiceMock.loginWithGoogleProfile).toHaveBeenCalledTimes(1)
  })

  it("faz login idempotente quando usuario ja existe", async () => {
    googleOAuthServiceMock.exchangeGoogleCodeForProfile.mockResolvedValueOnce({
      email: "existente@mmx.com",
      emailVerified: true,
      fullName: "Usuario Existente",
      picture: "https://img.test/u2.png",
    })

      oauthAuthServiceMock.loginWithGoogleProfile.mockResolvedValueOnce({
        isNewUser: false,
        user: {
          id: "u2",
          email: "existente@mmx.com",
          firstName: "Usuario",
          lastName: "Existente",
          planType: "FREE",
        },
    })

    const request = makeRequest("http://localhost:3000/api/auth/oauth/google/callback?code=abc&state=state-1")
    const response = await GET(request as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.isNewUser).toBe(false)
      expect(oauthAuthServiceMock.loginWithGoogleProfile).toHaveBeenCalledTimes(1)
  })
})
