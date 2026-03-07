import { beforeEach, describe, expect, it, vi } from "vitest"

const { userRepositoryMock, limiterMock, passwordHashMock } = vi.hoisted(() => ({
  userRepositoryMock: {
    findByEmail: vi.fn(),
    update: vi.fn(),
  },
  limiterMock: {
    applyRateLimit: vi.fn(),
    resolveClientIp: vi.fn(),
  },
  passwordHashMock: {
    verifyPassword: vi.fn(),
  },
}))

vi.mock("../../../../lib/server/repositories", () => ({
  userRepository: userRepositoryMock,
}))

vi.mock("../../../../lib/server/security/rate-limit", () => limiterMock)
vi.mock("../../../../lib/server/security/password-hash", () => passwordHashMock)

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
    passwordHashMock.verifyPassword.mockResolvedValue(true)
  })

  it("retorna 429 quando limite estoura", async () => {
    limiterMock.applyRateLimit.mockReturnValueOnce({ allowed: false, retryAfterSeconds: 30, remaining: 0 })

    const response = await POST(makeRequest({ email: "a@a.com", password: "123" }) as never)
    const payload = await response.json()

    expect(response.status).toBe(429)
    expect(payload.error.code).toBe("RATE_LIMITED")
  })

  it("retorna 200 com credenciais válidas", async () => {
    userRepositoryMock.findByEmail.mockResolvedValueOnce({
      id: "u1",
      email: "a@a.com",
      passwordHash: "hashed-password",
      firstName: "A",
      lastName: "B",
      planType: "FREE",
    })
    userRepositoryMock.update.mockResolvedValueOnce({})

    const response = await POST(makeRequest({ email: "a@a.com", password: "123" }) as never)

    expect(response.status).toBe(200)
    expect(passwordHashMock.verifyPassword).toHaveBeenCalledWith("123", "hashed-password")
  })
})
