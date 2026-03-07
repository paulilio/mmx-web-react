import { beforeEach, describe, expect, it, vi } from "vitest"

const { limiterMock } = vi.hoisted(() => ({
  limiterMock: {
    applyRateLimit: vi.fn(),
    resolveClientIp: vi.fn(),
  },
}))

vi.mock("../../../../lib/server/security/rate-limit", () => limiterMock)

import { POST } from "./route"

function makeRequest(body: unknown) {
  return {
    json: async () => body,
    headers: new Headers(),
  }
}

describe("/api/auth/refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    limiterMock.resolveClientIp.mockReturnValue("127.0.0.1")
    limiterMock.applyRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0, remaining: 9 })
  })

  it("retorna 429 quando limite estoura", async () => {
    limiterMock.applyRateLimit.mockReturnValueOnce({ allowed: false, retryAfterSeconds: 20, remaining: 0 })

    const response = await POST(makeRequest({ refreshToken: "rt_test" }) as never)
    const payload = await response.json()

    expect(response.status).toBe(429)
    expect(payload.error.code).toBe("RATE_LIMITED")
  })

  it("retorna 200 com refresh token válido", async () => {
    const response = await POST(makeRequest({ refreshToken: "rt_test" }) as never)

    expect(response.status).toBe(200)
  })
})
