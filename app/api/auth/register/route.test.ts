import { beforeEach, describe, expect, it, vi } from "vitest"

const { userRepositoryMock, limiterMock, passwordHashMock } = vi.hoisted(() => ({
  userRepositoryMock: {
    findByEmail: vi.fn(),
    create: vi.fn(),
  },
  limiterMock: {
    applyRateLimit: vi.fn(),
    resolveClientIp: vi.fn(),
  },
  passwordHashMock: {
    hashPassword: vi.fn(),
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

describe("/api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    limiterMock.resolveClientIp.mockReturnValue("127.0.0.1")
    limiterMock.applyRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0, remaining: 4 })
    passwordHashMock.hashPassword.mockResolvedValue("hashed-password")
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
    userRepositoryMock.findByEmail.mockResolvedValueOnce(null)
    userRepositoryMock.create.mockResolvedValueOnce({
      id: "u1",
      email: "a@a.com",
      firstName: "A",
      lastName: "B",
    })

    const response = await POST(
      makeRequest({ email: "a@a.com", password: "12345678", firstName: "A", lastName: "B" }) as never,
    )

    expect(response.status).toBe(201)
    expect(passwordHashMock.hashPassword).toHaveBeenCalledWith("12345678")
    expect(userRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        passwordHash: "hashed-password",
      }),
    )
  })
})
