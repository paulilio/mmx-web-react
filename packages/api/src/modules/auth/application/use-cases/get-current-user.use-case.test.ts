import { describe, expect, it, vi, beforeEach } from "vitest"
import { GetCurrentUserUseCase } from "./get-current-user.use-case"
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

function makeUserRepo(user: UserRecord | null): IUserRepository {
  return {
    findById: vi.fn(async () => user),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  }
}

describe("GetCurrentUserUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retorna AuthUserView + isEmailConfirmed para user existente", async () => {
    const user = makeUser({ id: "user-1", email: "u@test.com", firstName: "Ana", isEmailConfirmed: true, planType: "PREMIUM" })
    const useCase = new GetCurrentUserUseCase(makeUserRepo(user))

    const result = await useCase.execute("user-1")

    expect(result).toEqual({
      id: "user-1",
      email: "u@test.com",
      firstName: "Ana",
      lastName: "Silva",
      planType: "PREMIUM",
      isEmailConfirmed: true,
    })
  })

  it("retorna isEmailConfirmed=false quando user ainda não confirmou", async () => {
    const user = makeUser({ isEmailConfirmed: false })
    const useCase = new GetCurrentUserUseCase(makeUserRepo(user))

    const result = await useCase.execute("user-1")

    expect(result.isEmailConfirmed).toBe(false)
  })

  it("lança USER_NOT_FOUND quando user não existe", async () => {
    const useCase = new GetCurrentUserUseCase(makeUserRepo(null))

    await expect(useCase.execute("ghost-id")).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      status: 404,
    })
  })
})
