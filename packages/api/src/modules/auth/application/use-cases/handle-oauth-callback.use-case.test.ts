import { describe, expect, it, vi, beforeEach } from "vitest"
import { HandleOAuthCallbackUseCase, type OAuthProfile } from "./handle-oauth-callback.use-case"
import type { IUserRepository } from "../ports/user-repository.port"
import type { IRefreshSessionRepository } from "../ports/refresh-session-repository.port"
import type { IOAuthAccountRepository } from "../ports/oauth-account-repository.port"
import type { UserRecord } from "../../domain/user.types"

// JWT_*_SECRET env precisam estar setados para issueAccessToken/issueRefreshToken funcionarem.
process.env.JWT_ACCESS_SECRET = "test-access-secret"
process.env.JWT_REFRESH_SECRET = "test-refresh-secret"

function makeUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: "user-1",
    email: "user@test.com",
    passwordHash: null,
    firstName: "Test",
    lastName: "User",
    phone: null,
    cpfCnpj: null,
    isEmailConfirmed: false,
    defaultOrganizationId: null,
    planType: "FREE",
    profilePhoto: null,
    preferences: null,
    lastLogin: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  }
}

function makeUserRepo(initial: { byId?: UserRecord | null; byEmail?: UserRecord | null } = {}): IUserRepository & { _spies: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } } {
  const create = vi.fn(async (data) => makeUser({ id: "new-user", email: data.email, firstName: data.firstName, lastName: data.lastName, isEmailConfirmed: data.isEmailConfirmed ?? false }))
  const update = vi.fn(async (id, data) => makeUser({ id, ...data, email: initial.byEmail?.email ?? initial.byId?.email ?? "user@test.com" }))
  return {
    findById: vi.fn(async () => initial.byId ?? null),
    findByEmail: vi.fn(async () => initial.byEmail ?? null),
    create,
    update,
    _spies: { create, update },
  }
}

function makeSessionRepo(): IRefreshSessionRepository & { _spies: { create: ReturnType<typeof vi.fn> } } {
  const create = vi.fn(async (input) => ({
    id: "sess-1",
    userId: input.userId,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
    revokedAt: null,
    createdAt: new Date(),
  }))
  return {
    create,
    findActiveByTokenHash: vi.fn(async () => null),
    revokeByTokenHash: vi.fn(async () => undefined),
    revokeAllForUser: vi.fn(async () => 0),
    deleteExpired: vi.fn(async () => 0),
    _spies: { create },
  }
}

function makeOAuthRepo(initial: { linked?: { userId: string } | null } = {}): IOAuthAccountRepository & { _spies: { create: ReturnType<typeof vi.fn> } } {
  const create = vi.fn(async (input) => ({
    id: "oauth-1",
    userId: input.userId,
    provider: input.provider,
    providerAccountId: input.providerAccountId,
    createdAt: new Date(),
  }))
  return {
    findByProviderAccount: vi.fn(async () =>
      initial.linked
        ? {
            id: "oauth-existing",
            userId: initial.linked.userId,
            provider: "GOOGLE" as const,
            providerAccountId: "google-sub-123",
            createdAt: new Date(),
          }
        : null,
    ),
    create,
    listForUser: vi.fn(async () => []),
    _spies: { create },
  }
}

const profile: OAuthProfile = {
  email: "novo@test.com",
  givenName: "Novo",
  familyName: "Usuário",
  fullName: "Novo Usuário",
  picture: "https://x.com/pic.jpg",
  provider: "google",
  providerAccountId: "google-sub-123",
}

describe("HandleOAuthCallbackUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("cria user novo + OAuthAccount na primeira vez (isNewUser=true)", async () => {
    const userRepo = makeUserRepo({ byEmail: null })
    const sessionRepo = makeSessionRepo()
    const oauthRepo = makeOAuthRepo({ linked: null })

    const useCase = new HandleOAuthCallbackUseCase(userRepo, sessionRepo, oauthRepo)
    const result = await useCase.execute(profile)

    expect(result.isNewUser).toBe(true)
    expect(userRepo._spies.create).toHaveBeenCalledTimes(1)
    expect(userRepo._spies.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "novo@test.com",
        passwordHash: null,
        isEmailConfirmed: true,
        firstName: "Novo",
        lastName: "Usuário",
        planType: "FREE",
      }),
    )
    expect(oauthRepo._spies.create).toHaveBeenCalledWith({
      userId: "new-user",
      provider: "GOOGLE",
      providerAccountId: "google-sub-123",
    })
    expect(sessionRepo._spies.create).toHaveBeenCalledTimes(1)
    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
  })

  it("linka OAuthAccount em user existente por email (isNewUser=false)", async () => {
    const existing = makeUser({ id: "existing-user", email: "novo@test.com", isEmailConfirmed: false })
    const userRepo = makeUserRepo({ byEmail: existing })
    const sessionRepo = makeSessionRepo()
    const oauthRepo = makeOAuthRepo({ linked: null })

    const useCase = new HandleOAuthCallbackUseCase(userRepo, sessionRepo, oauthRepo)
    const result = await useCase.execute(profile)

    expect(result.isNewUser).toBe(false)
    expect(userRepo._spies.create).not.toHaveBeenCalled()
    expect(userRepo._spies.update).toHaveBeenCalledWith(
      "existing-user",
      expect.objectContaining({ isEmailConfirmed: true }),
    )
    expect(oauthRepo._spies.create).toHaveBeenCalledWith({
      userId: "existing-user",
      provider: "GOOGLE",
      providerAccountId: "google-sub-123",
    })
  })

  it("login subsequente: encontra OAuthAccount pelo providerAccountId, NÃO cria nem linka novamente", async () => {
    const existing = makeUser({ id: "existing-user", email: "novo@test.com", isEmailConfirmed: true })
    const userRepo = makeUserRepo({ byId: existing })
    const sessionRepo = makeSessionRepo()
    const oauthRepo = makeOAuthRepo({ linked: { userId: "existing-user" } })

    const useCase = new HandleOAuthCallbackUseCase(userRepo, sessionRepo, oauthRepo)
    const result = await useCase.execute(profile)

    expect(result.isNewUser).toBe(false)
    expect(userRepo.findByEmail).not.toHaveBeenCalled()
    expect(userRepo._spies.create).not.toHaveBeenCalled()
    expect(oauthRepo._spies.create).not.toHaveBeenCalled()
    expect(userRepo._spies.update).toHaveBeenCalledWith(
      "existing-user",
      expect.objectContaining({ isEmailConfirmed: true, lastLogin: expect.any(Date) }),
    )
  })

  it("emite tokens e persiste RefreshSession com hash + IP/userAgent do contexto", async () => {
    const userRepo = makeUserRepo({ byEmail: null })
    const sessionRepo = makeSessionRepo()
    const oauthRepo = makeOAuthRepo()

    const useCase = new HandleOAuthCallbackUseCase(userRepo, sessionRepo, oauthRepo)
    await useCase.execute(profile, { userAgent: "Chrome/123", ipAddress: "203.0.113.5" })

    const sessionCall = sessionRepo._spies.create.mock.calls[0]?.[0] as { tokenHash: string; userAgent: string | null; ipAddress: string | null }
    expect(sessionCall.userAgent).toBe("Chrome/123")
    expect(sessionCall.ipAddress).toBe("203.0.113.5")
    expect(sessionCall.tokenHash).toMatch(/^[a-f0-9]{64}$/)
  })

  it("falha com OAUTH_ACCOUNT_ORPHAN se OAuthAccount linkado aponta para user inexistente", async () => {
    const userRepo = makeUserRepo({ byId: null })
    const sessionRepo = makeSessionRepo()
    const oauthRepo = makeOAuthRepo({ linked: { userId: "ghost" } })

    const useCase = new HandleOAuthCallbackUseCase(userRepo, sessionRepo, oauthRepo)

    await expect(useCase.execute(profile)).rejects.toMatchObject({
      code: "OAUTH_ACCOUNT_ORPHAN",
      status: 500,
    })
  })

  it("usa providerLabel como fallback quando fullName ausente", async () => {
    const userRepo = makeUserRepo({ byEmail: null })
    const sessionRepo = makeSessionRepo()
    const oauthRepo = makeOAuthRepo()

    const useCase = new HandleOAuthCallbackUseCase(userRepo, sessionRepo, oauthRepo)
    await useCase.execute({
      email: "anon@test.com",
      provider: "microsoft",
      providerAccountId: "ms-sub-456",
      // sem givenName/familyName/fullName
    })

    expect(userRepo._spies.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Usuário",
        lastName: "Microsoft",
      }),
    )
  })
})
