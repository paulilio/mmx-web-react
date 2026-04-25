import { describe, expect, it, vi, beforeEach } from "vitest"
import { LogoutAllUseCase } from "./logout-all.use-case"
import type { IRefreshSessionRepository } from "../ports/refresh-session-repository.port"

function makeSessionRepo(revokedCount: number): IRefreshSessionRepository & { _spies: { revokeAllForUser: ReturnType<typeof vi.fn> } } {
  const revokeAllForUser = vi.fn(async () => revokedCount)
  return {
    create: vi.fn(),
    findActiveByTokenHash: vi.fn(),
    revokeByTokenHash: vi.fn(),
    revokeAllForUser,
    deleteExpired: vi.fn(),
    _spies: { revokeAllForUser },
  }
}

describe("LogoutAllUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("revoga todas as sessions do user e retorna o count", async () => {
    const repo = makeSessionRepo(3)
    const useCase = new LogoutAllUseCase(repo)

    const result = await useCase.execute("user-1")

    expect(repo._spies.revokeAllForUser).toHaveBeenCalledWith("user-1")
    expect(result).toEqual({ revokedCount: 3 })
  })

  it("retorna 0 quando user não tem sessions ativas", async () => {
    const repo = makeSessionRepo(0)
    const useCase = new LogoutAllUseCase(repo)

    const result = await useCase.execute("user-sem-sessions")

    expect(result).toEqual({ revokedCount: 0 })
  })
})
