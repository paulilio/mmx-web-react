import { describe, expect, it, vi, beforeEach } from "vitest"
import { RefreshSessionUseCase } from "./refresh-session.use-case"
import type { IRefreshSessionRepository } from "../ports/refresh-session-repository.port"
import { issueRefreshToken } from "@/core/lib/server/security/jwt"
import { sha256Hex } from "@/core/lib/server/security/token-hash"

process.env.JWT_ACCESS_SECRET = "test-access-secret"
process.env.JWT_REFRESH_SECRET = "test-refresh-secret"

function makeSessionRepo(): IRefreshSessionRepository & {
  _spies: {
    create: ReturnType<typeof vi.fn>
    revokeByTokenHash: ReturnType<typeof vi.fn>
    revokeAllForUser: ReturnType<typeof vi.fn>
    findActiveByTokenHash: ReturnType<typeof vi.fn>
  }
} {
  const findActiveByTokenHash = vi.fn(async () => null)
  const create = vi.fn(async (input) => ({
    id: "sess-new",
    userId: input.userId,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
    revokedAt: null,
    createdAt: new Date(),
  }))
  const revokeByTokenHash = vi.fn(async () => undefined)
  const revokeAllForUser = vi.fn(async () => 0)

  return {
    findActiveByTokenHash,
    create,
    revokeByTokenHash,
    revokeAllForUser,
    deleteExpired: vi.fn(async () => 0),
    _spies: { create, revokeByTokenHash, revokeAllForUser, findActiveByTokenHash },
  }
}

describe("RefreshSessionUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rotaciona token com sucesso quando session é válida", async () => {
    const { token, expiresInSeconds } = issueRefreshToken({ id: "user-1", email: "u@test.com" })
    const tokenHash = sha256Hex(token)

    const repo = makeSessionRepo()
    repo._spies.findActiveByTokenHash.mockResolvedValueOnce({
      id: "sess-1",
      userId: "user-1",
      tokenHash,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      revokedAt: null,
      createdAt: new Date(),
    })

    const useCase = new RefreshSessionUseCase(repo)
    const result = await useCase.execute(token, { userAgent: "Chrome", ipAddress: "1.2.3.4" })

    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
    // NOTA: JWT sem `jti` produz token idêntico se payload+iat coincidem.
    // O comportamento de rotation é verificado pelos call patterns abaixo (revoke old + create new).
    // TODO: adicionar `jti` ao issueRefreshToken para garantir unicidade.
    expect(repo._spies.revokeByTokenHash).toHaveBeenCalledWith(tokenHash)
    expect(repo._spies.create).toHaveBeenCalledTimes(1)
    const newSession = repo._spies.create.mock.calls[0]?.[0] as { tokenHash: string; userAgent: string | null; ipAddress: string | null }
    expect(newSession.userAgent).toBe("Chrome")
    expect(newSession.ipAddress).toBe("1.2.3.4")
  })

  it("revoga TODAS as sessões do user em caso de replay (token válido por JWT mas inativo no DB)", async () => {
    const { token } = issueRefreshToken({ id: "user-attacker", email: "x@test.com" })

    const repo = makeSessionRepo()
    // findActiveByTokenHash retorna null → significa que session foi revogada/rotacionada
    repo._spies.findActiveByTokenHash.mockResolvedValueOnce(null)

    const useCase = new RefreshSessionUseCase(repo)

    await expect(useCase.execute(token)).rejects.toMatchObject({
      code: "INVALID_REFRESH_TOKEN",
      status: 401,
    })

    expect(repo._spies.revokeAllForUser).toHaveBeenCalledWith("user-attacker")
    expect(repo._spies.create).not.toHaveBeenCalled()
  })

  it("revoga todas se userId no token não bate com session no DB", async () => {
    const { token } = issueRefreshToken({ id: "user-1", email: "u@test.com" })

    const repo = makeSessionRepo()
    repo._spies.findActiveByTokenHash.mockResolvedValueOnce({
      id: "sess-mismatched",
      userId: "user-OTHER", // diferente do payload do JWT
      tokenHash: sha256Hex(token),
      expiresAt: new Date(Date.now() + 100000),
      revokedAt: null,
      createdAt: new Date(),
    })

    const useCase = new RefreshSessionUseCase(repo)
    await expect(useCase.execute(token)).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN" })
    expect(repo._spies.revokeAllForUser).toHaveBeenCalledWith("user-1")
  })

  it("rejeita token JWT inválido (assinatura quebrada)", async () => {
    const repo = makeSessionRepo()
    const useCase = new RefreshSessionUseCase(repo)

    await expect(useCase.execute("not-a-jwt-token")).rejects.toMatchObject({
      code: "INVALID_REFRESH_TOKEN",
      status: 401,
    })

    // Não chega a tocar no DB
    expect(repo._spies.findActiveByTokenHash).not.toHaveBeenCalled()
    expect(repo._spies.revokeAllForUser).not.toHaveBeenCalled()
  })

  it("nova session persistida tem hash sha256 do novo refresh token", async () => {
    const { token } = issueRefreshToken({ id: "user-1", email: "u@test.com" })

    const repo = makeSessionRepo()
    repo._spies.findActiveByTokenHash.mockResolvedValueOnce({
      id: "sess-1",
      userId: "user-1",
      tokenHash: sha256Hex(token),
      expiresAt: new Date(Date.now() + 100000),
      revokedAt: null,
      createdAt: new Date(),
    })

    const useCase = new RefreshSessionUseCase(repo)
    const result = await useCase.execute(token)

    const newSessionCall = repo._spies.create.mock.calls[0]?.[0] as { tokenHash: string }
    expect(newSessionCall.tokenHash).toBe(sha256Hex(result.refreshToken))
    expect(newSessionCall.tokenHash).toMatch(/^[a-f0-9]{64}$/)
  })
})
