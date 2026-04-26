import { describe, expect, it, vi, beforeEach } from "vitest"
import { UpdatePreferencesUseCase } from "./update-preferences.use-case"
import type { IUserRepository } from "../ports/user-repository.port"
import type { UserRecord } from "../../domain/user.types"

function makeUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: "user-1",
    email: "u@test.com",
    passwordHash: null,
    firstName: "Ana",
    lastName: "Silva",
    phone: null,
    cpfCnpj: null,
    isEmailConfirmed: true,
    defaultOrganizationId: null,
    planType: "FREE",
    profilePhoto: null,
    preferences: null,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function makeRepo(user: UserRecord | null): { repo: IUserRepository; updateMock: ReturnType<typeof vi.fn> } {
  const updateMock = vi.fn(async (id: string, data: { preferences?: unknown }) => ({
    ...(user ?? makeUser({ id })),
    preferences: data.preferences,
  })) as unknown as ReturnType<typeof vi.fn>
  return {
    updateMock,
    repo: {
      findById: vi.fn(async () => user),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: updateMock as unknown as IUserRepository["update"],
    },
  }
}

describe("UpdatePreferencesUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("faz merge da flag hasSeenWelcome preservando preferências existentes", async () => {
    const user = makeUser({ preferences: { theme: "dark" } })
    const { repo, updateMock } = makeRepo(user)
    const useCase = new UpdatePreferencesUseCase(repo)

    const result = await useCase.execute("user-1", { hasSeenWelcome: true })

    expect(updateMock).toHaveBeenCalledWith("user-1", {
      preferences: { theme: "dark", hasSeenWelcome: true },
    })
    expect(result.preferences).toEqual({ theme: "dark", hasSeenWelcome: true })
  })

  it("aceita patch quando user não tem preferências prévias", async () => {
    const user = makeUser({ preferences: null })
    const { repo, updateMock } = makeRepo(user)
    const useCase = new UpdatePreferencesUseCase(repo)

    await useCase.execute("user-1", { hasSeenWelcome: true })

    expect(updateMock).toHaveBeenCalledWith("user-1", {
      preferences: { hasSeenWelcome: true },
    })
  })

  it("ignora chaves não permitidas no patch", async () => {
    const user = makeUser({ preferences: {} })
    const { repo, updateMock } = makeRepo(user)
    const useCase = new UpdatePreferencesUseCase(repo)

    await useCase.execute("user-1", { hasSeenWelcome: true, planType: "PREMIUM", isAdmin: true })

    expect(updateMock).toHaveBeenCalledWith("user-1", {
      preferences: { hasSeenWelcome: true },
    })
  })

  it("rejeita patch sem nenhuma chave válida", async () => {
    const user = makeUser({ preferences: {} })
    const { repo } = makeRepo(user)
    const useCase = new UpdatePreferencesUseCase(repo)

    await expect(useCase.execute("user-1", { foo: "bar" })).rejects.toMatchObject({
      code: "INVALID_PREFERENCES",
      status: 400,
    })
  })

  it("rejeita patch que não é objeto", async () => {
    const user = makeUser({ preferences: {} })
    const { repo } = makeRepo(user)
    const useCase = new UpdatePreferencesUseCase(repo)

    await expect(useCase.execute("user-1", null)).rejects.toMatchObject({ code: "INVALID_PREFERENCES" })
  })

  it("lança USER_NOT_FOUND se user inexistente", async () => {
    const { repo } = makeRepo(null)
    const useCase = new UpdatePreferencesUseCase(repo)

    await expect(useCase.execute("ghost", { hasSeenWelcome: true })).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
    })
  })
})
