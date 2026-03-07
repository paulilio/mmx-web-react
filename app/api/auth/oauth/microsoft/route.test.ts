import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { GET } from "./route"

describe("/api/auth/oauth/microsoft", () => {
  const originalClientId = process.env.MICROSOFT_CLIENT_ID
  const originalClientSecret = process.env.MICROSOFT_CLIENT_SECRET
  const originalRedirectUri = process.env.MICROSOFT_REDIRECT_URI

  beforeEach(() => {
    process.env.MICROSOFT_CLIENT_ID = "ms-client-id"
    process.env.MICROSOFT_CLIENT_SECRET = "ms-client-secret"
    process.env.MICROSOFT_REDIRECT_URI = "http://localhost:3000/api/auth/oauth/microsoft/callback"
  })

  afterEach(() => {
    if (originalClientId === undefined) delete process.env.MICROSOFT_CLIENT_ID
    else process.env.MICROSOFT_CLIENT_ID = originalClientId

    if (originalClientSecret === undefined) delete process.env.MICROSOFT_CLIENT_SECRET
    else process.env.MICROSOFT_CLIENT_SECRET = originalClientSecret

    if (originalRedirectUri === undefined) delete process.env.MICROSOFT_REDIRECT_URI
    else process.env.MICROSOFT_REDIRECT_URI = originalRedirectUri
  })

  it("retorna 503 quando Microsoft OAuth nao esta configurado", async () => {
    delete process.env.MICROSOFT_CLIENT_ID
    delete process.env.MICROSOFT_CLIENT_SECRET

    const request = {
      nextUrl: new URL("http://localhost:3000/api/auth/oauth/microsoft"),
    }

    const response = await GET(request as never)
    const payload = await response.json()

    expect(response.status).toBe(503)
    expect(payload.error.code).toBe("MICROSOFT_OAUTH_NOT_CONFIGURED")
  })

  it("redireciona para autorizacao da Microsoft quando configurado", async () => {
    const request = {
      nextUrl: new URL("http://localhost:3000/api/auth/oauth/microsoft"),
    }

    const response = await GET(request as never)

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toContain("https://login.microsoftonline.com")
    expect(response.cookies.get("mmx_oauth_state_microsoft")?.value).toBeTruthy()
  })
})
