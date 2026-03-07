import { beforeEach, describe, expect, it } from "vitest"
import { issueRefreshToken } from "../../../../lib/server/security/jwt"
import { clearRefreshSessionsForTests, isRefreshSessionValid, persistRefreshSession } from "../../../../lib/server/security/refresh-session-store"
import { POST } from "./route"

function makeRequest(body: unknown, cookieRefreshToken?: string) {
  return {
    json: async () => body,
    cookies: {
      get: (name: string) => {
        if (name === "mmx_refresh_token" && cookieRefreshToken) {
          return { value: cookieRefreshToken }
        }

        return undefined
      },
    },
  }
}

describe("/api/auth/logout", () => {
  beforeEach(() => {
    clearRefreshSessionsForTests()
  })

  it("revoga refresh token informado no body", async () => {
    const refreshTokenResult = issueRefreshToken({ id: "user-1", email: "user@mmx.com" })
    persistRefreshSession(refreshTokenResult.token, "user-1", refreshTokenResult.expiresInSeconds)

    const response = await POST(makeRequest({ refreshToken: refreshTokenResult.token }) as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.success).toBe(true)
    expect(isRefreshSessionValid(refreshTokenResult.token, "user-1")).toBe(false)
  })

  it("revoga refresh token vindo de cookie", async () => {
    const refreshTokenResult = issueRefreshToken({ id: "user-1", email: "user@mmx.com" })
    persistRefreshSession(refreshTokenResult.token, "user-1", refreshTokenResult.expiresInSeconds)

    const response = await POST(makeRequest({}, refreshTokenResult.token) as never)

    expect(response.status).toBe(200)
    expect(isRefreshSessionValid(refreshTokenResult.token, "user-1")).toBe(false)
  })
})
