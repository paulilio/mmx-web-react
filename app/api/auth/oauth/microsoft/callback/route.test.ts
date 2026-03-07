import { beforeEach, describe, expect, it, vi } from "vitest"

const { userRepositoryMock, microsoftOAuthServiceMock } = vi.hoisted(() => ({
  userRepositoryMock: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  microsoftOAuthServiceMock: {
    resolveMicrosoftOAuthConfig: vi.fn(),
    exchangeMicrosoftCodeForProfile: vi.fn(),
  },
}))

vi.mock("../../../../../../lib/server/repositories", () => ({
  userRepository: userRepositoryMock,
}))

vi.mock("../../../../../../lib/server/services/microsoft-oauth-service", () => microsoftOAuthServiceMock)

import { GET } from "./route"

function makeRequest(url: string, stateCookie = "state-1") {
  return {
    nextUrl: new URL(url),
    cookies: {
      get: vi.fn().mockReturnValue(stateCookie ? { value: stateCookie } : undefined),
    },
  }
}

describe("/api/auth/oauth/microsoft/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    microsoftOAuthServiceMock.resolveMicrosoftOAuthConfig.mockReturnValue({
      clientId: "ms-client-id",
      clientSecret: "ms-client-secret",
      tenantId: "common",
      redirectUri: "http://localhost:3000/api/auth/oauth/microsoft/callback",
    })
  })

  it("retorna 401 quando state e invalido", async () => {
    const request = makeRequest(
      "http://localhost:3000/api/auth/oauth/microsoft/callback?code=abc&state=outro",
      "state-1",
    )

    const response = await GET(request as never)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("OAUTH_STATE_INVALID")
  })

  it("cria usuario quando email nao existe", async () => {
    microsoftOAuthServiceMock.exchangeMicrosoftCodeForProfile.mockResolvedValueOnce({
      email: "novo-ms@mmx.com",
      givenName: "Novo",
      familyName: "Microsoft",
      fullName: "Novo Microsoft",
    })
    userRepositoryMock.findByEmail.mockResolvedValueOnce(null)
    userRepositoryMock.create.mockResolvedValueOnce({
      id: "u-ms-1",
      email: "novo-ms@mmx.com",
      firstName: "Novo",
      lastName: "Microsoft",
      planType: "FREE",
    })

    const request = makeRequest("http://localhost:3000/api/auth/oauth/microsoft/callback?code=abc&state=state-1")
    const response = await GET(request as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.isNewUser).toBe(true)
    expect(userRepositoryMock.create).toHaveBeenCalledTimes(1)
    expect(userRepositoryMock.update).not.toHaveBeenCalled()
  })

  it("faz login idempotente quando usuario ja existe", async () => {
    microsoftOAuthServiceMock.exchangeMicrosoftCodeForProfile.mockResolvedValueOnce({
      email: "existente-ms@mmx.com",
      fullName: "Existente Microsoft",
    })
    userRepositoryMock.findByEmail.mockResolvedValueOnce({
      id: "u-ms-2",
      email: "existente-ms@mmx.com",
      firstName: "Existente",
      lastName: "Microsoft",
      planType: "FREE",
    })
    userRepositoryMock.update.mockResolvedValueOnce({
      id: "u-ms-2",
      email: "existente-ms@mmx.com",
      firstName: "Existente",
      lastName: "Microsoft",
      planType: "FREE",
    })

    const request = makeRequest("http://localhost:3000/api/auth/oauth/microsoft/callback?code=abc&state=state-1")
    const response = await GET(request as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.isNewUser).toBe(false)
    expect(userRepositoryMock.create).not.toHaveBeenCalled()
    expect(userRepositoryMock.update).toHaveBeenCalledTimes(1)
  })
})
