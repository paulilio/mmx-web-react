import { beforeEach, describe, expect, it, vi } from "vitest"

const { authServiceMock, limiterMock } = vi.hoisted(() => ({
  authServiceMock: {
    login: vi.fn(),
  },
  limiterMock: {
    applyRateLimit: vi.fn(),
    resolveClientIp: vi.fn(),
  },
}))

vi.mock("../../../../lib/server/services", () => ({
  authService: authServiceMock,
}))

vi.mock("../../../../lib/server/security/rate-limit", () => limiterMock)

import { POST } from "./route"

function makeRequest(body: unknown) {
  return {
    json: async () => body,
    headers: new Headers(),
  }
}

describe("/api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    limiterMock.resolveClientIp.mockReturnValue("127.0.0.1")
    limiterMock.applyRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0, remaining: 4 })
  })

  it("retorna 429 quando limite estoura", async () => {
    limiterMock.applyRateLimit.mockReturnValueOnce({ allowed: false, retryAfterSeconds: 30, remaining: 0 })

    const response = await POST(makeRequest({ email: "a@a.com", password: "123" }) as never)
    const payload = await response.json()

    expect(response.status).toBe(429)
    expect(payload.error.code).toBe("RATE_LIMITED")
  })

  it("retorna 200 com credenciais válidas", async () => {
    authServiceMock.login.mockResolvedValueOnce({
      id: "u1",
      email: "a@a.com",
      firstName: "A",
      lastName: "B",
      planType: "FREE",
    })

    const response = await POST(makeRequest({ email: "a@a.com", password: "123" }) as never)

    expect(response.status).toBe(200)
    expect(authServiceMock.login).toHaveBeenCalledWith({ email: "a@a.com", password: "123" })
  })

  it("retorna 401 para credenciais invalidas", async () => {
    authServiceMock.login.mockRejectedValueOnce(new Error("Credenciais invalidas"))

    const response = await POST(makeRequest({ email: "a@a.com", password: "123" }) as never)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("INVALID_CREDENTIALS")
  })
})
