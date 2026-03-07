import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { GET } from "./route"

describe("/api/auth/oauth/google", () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID
  const originalClientSecret = process.env.GOOGLE_CLIENT_SECRET
  const originalRedirectUri = process.env.GOOGLE_REDIRECT_URI

  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = "google-client-id"
    process.env.GOOGLE_CLIENT_SECRET = "google-client-secret"
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/api/auth/oauth/google/callback"
  })

  afterEach(() => {
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID
    else process.env.GOOGLE_CLIENT_ID = originalClientId

    if (originalClientSecret === undefined) delete process.env.GOOGLE_CLIENT_SECRET
    else process.env.GOOGLE_CLIENT_SECRET = originalClientSecret

    if (originalRedirectUri === undefined) delete process.env.GOOGLE_REDIRECT_URI
    else process.env.GOOGLE_REDIRECT_URI = originalRedirectUri
  })

  it("retorna 503 quando Google OAuth nao esta configurado", async () => {
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET

    const request = {
      nextUrl: new URL("http://localhost:3000/api/auth/oauth/google"),
    }

    const response = await GET(request as never)
    const payload = await response.json()

    expect(response.status).toBe(503)
    expect(payload.error.code).toBe("GOOGLE_OAUTH_NOT_CONFIGURED")
  })

  it("redireciona para autorizacao do Google quando configurado", async () => {
    const request = {
      nextUrl: new URL("http://localhost:3000/api/auth/oauth/google"),
    }

    const response = await GET(request as never)

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toContain("https://accounts.google.com/o/oauth2/v2/auth")
    expect(response.cookies.get("mmx_oauth_state")?.value).toBeTruthy()
  })
})
