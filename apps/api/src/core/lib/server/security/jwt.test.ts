import { describe, expect, it } from "vitest"
import { issueAccessToken, issueRefreshToken, verifyAccessToken, verifyRefreshToken } from "./jwt"

describe("jwt", () => {
  it("emite e valida access token", () => {
    const { token, expiresInSeconds } = issueAccessToken({
      id: "user-1",
      email: "user@mmx.com",
    })

    const payload = verifyAccessToken(token)

    expect(expiresInSeconds).toBeGreaterThan(0)
    expect(payload.sub).toBe("user-1")
    expect(payload.email).toBe("user@mmx.com")
    expect(payload.type).toBe("access")
  })

  it("emite e valida refresh token", () => {
    const { token, expiresInSeconds } = issueRefreshToken({
      id: "user-1",
      email: "user@mmx.com",
    })

    const payload = verifyRefreshToken(token)

    expect(expiresInSeconds).toBeGreaterThan(0)
    expect(payload.sub).toBe("user-1")
    expect(payload.email).toBe("user@mmx.com")
    expect(payload.type).toBe("refresh")
  })

  it("falha ao validar refresh token como access", () => {
    const { token } = issueRefreshToken({
      id: "user-1",
      email: "user@mmx.com",
    })

    expect(() => verifyAccessToken(token)).toThrow()
  })
})
