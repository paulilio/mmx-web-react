import { describe, expect, it, vi, beforeEach } from "vitest"
import { LogoutUseCase } from "./logout.use-case"
import type { IRefreshSessionRepository } from "../ports/refresh-session-repository.port"
import { sha256Hex } from "@/core/lib/server/security/token-hash"

function makeSessionRepo(): IRefreshSessionRepository & { _spies: { revokeByTokenHash: ReturnType<typeof vi.fn> } } {
  const revokeByTokenHash = vi.fn(async () => undefined)
  return {
    create: vi.fn(),
    findActiveByTokenHash: vi.fn(),
    revokeByTokenHash,
    revokeAllForUser: vi.fn(),
    deleteExpired: vi.fn(),
    _spies: { revokeByTokenHash },
  }
}

describe("LogoutUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("revoga session pelo hash sha256 do refresh token", async () => {
    const repo = makeSessionRepo()
    const useCase = new LogoutUseCase(repo)
    const token = "some-refresh-token"

    await useCase.execute(token)

    expect(repo._spies.revokeByTokenHash).toHaveBeenCalledWith(sha256Hex(token))
    expect(repo._spies.revokeByTokenHash).toHaveBeenCalledTimes(1)
  })

  it("é no-op quando refreshToken é null", async () => {
    const repo = makeSessionRepo()
    const useCase = new LogoutUseCase(repo)

    await useCase.execute(null)

    expect(repo._spies.revokeByTokenHash).not.toHaveBeenCalled()
  })

  it("nunca lança exception (mesmo se token não bater)", async () => {
    const repo = makeSessionRepo()
    repo._spies.revokeByTokenHash.mockResolvedValueOnce(undefined) // updateMany 0 rows é silencioso
    const useCase = new LogoutUseCase(repo)

    await expect(useCase.execute("token-que-nao-existe")).resolves.toBeUndefined()
  })
})
