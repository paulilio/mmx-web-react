import { beforeEach, describe, expect, it, vi } from "vitest"

const { authServiceMock, limiterMock } = vi.hoisted(() => ({
  authServiceMock: {
    register: vi.fn(),
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

describe("/api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    limiterMock.resolveClientIp.mockReturnValue("127.0.0.1")
    limiterMock.applyRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0, remaining: 4 })
  })

  it("retorna 429 quando limite estoura", async () => {
    limiterMock.applyRateLimit.mockReturnValueOnce({ allowed: false, retryAfterSeconds: 15, remaining: 0 })

    const response = await POST(
      makeRequest({ email: "a@a.com", password: "12345678", firstName: "A", lastName: "B" }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(429)
    expect(payload.error.code).toBe("RATE_LIMITED")
  })

  it("retorna 201 em registro válido", async () => {
    authServiceMock.register.mockResolvedValueOnce({
      id: "u1",
      email: "a@a.com",
      firstName: "A",
      lastName: "B",
      planType: "FREE",
    })

    const response = await POST(
      makeRequest({ email: "a@a.com", password: "12345678", firstName: "A", lastName: "B" }) as never,
    )

    expect(response.status).toBe(201)
    expect(authServiceMock.register).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "a@a.com",
        password: "12345678",
      }),
    )
  })

  it("retorna 409 quando email ja existe", async () => {
    authServiceMock.register.mockRejectedValueOnce(new Error("Email ja esta em uso"))

    const response = await POST(
      makeRequest({ email: "a@a.com", password: "12345678", firstName: "A", lastName: "B" }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(409)
    expect(payload.error.code).toBe("USER_ALREADY_EXISTS")
  })
})
