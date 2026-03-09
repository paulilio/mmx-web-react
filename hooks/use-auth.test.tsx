/** @vitest-environment jsdom */

import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocked = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  pushMock: vi.fn(),
  apiPostMock: vi.fn(),
  setContextMock: vi.fn(),
  cleanupUserDataMock: vi.fn(),
  logAuditEventMock: vi.fn(),
  useApiMode: true,
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocked.replaceMock,
    push: mocked.pushMock,
  }),
}))

vi.mock("@/lib/shared/config", () => ({
  get USE_API() {
    return mocked.useApiMode
  },
}))

vi.mock("@/lib/client/api", () => ({
  api: {
    post: mocked.apiPostMock,
  },
}))

vi.mock("@/lib/server/user-data-service", () => ({
  userDataService: {
    setContext: mocked.setContextMock,
    cleanupUserData: mocked.cleanupUserDataMock,
  },
}))

vi.mock("@/lib/server/migration-service", () => ({
  UNIFIED_STORAGE_KEYS: {
    users: "mmx_users",
    authSessions: "mmx_auth_sessions",
  },
  migrationService: {
    needsMigration: vi.fn(() => false),
    migrateToUnifiedStructure: vi.fn(async () => ({ success: true })),
    getUserData: vi.fn(() => []),
  },
}))

vi.mock("@/lib/shared/utils", () => ({
  generateSessionToken: vi.fn(() => "session_test"),
  generateUserId: vi.fn(() => "user_test"),
  createDefaultAccount: vi.fn(),
  logAuditEvent: mocked.logAuditEventMock,
}))

import { AuthProvider, useAuth } from "./use-auth"

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe("use-auth login API mode", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocked.useApiMode = true
    localStorage.clear()
    localStorage.setItem(
      "auth_session",
      JSON.stringify({ token: "old", userId: "old", expiresAt: "2999-01-01T00:00:00.000Z" }),
    )
  })

  it("faz login via /api/auth/login e atualiza estado/contexto", async () => {
    mocked.apiPostMock.mockResolvedValueOnce({
      accessToken: "access",
      refreshToken: "refresh",
      expiresIn: 900,
      user: {
        id: "user_1",
        email: "user@test.com",
        firstName: "Ana",
        lastName: "Silva",
        planType: "free",
      },
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.login("user@test.com", "123456")
    })

    expect(mocked.apiPostMock).toHaveBeenCalledWith("/auth/login", {
      email: "user@test.com",
      password: "123456",
    })
    expect(mocked.replaceMock).toHaveBeenCalledWith("/dashboard")
    expect(mocked.setContextMock).toHaveBeenCalled()
    expect(result.current.user?.email).toBe("user@test.com")
    expect(localStorage.getItem("auth_session")).toBeNull()
    expect(localStorage.getItem("auth_user")).toContain("user@test.com")
  })

  it("restaura usuario no bootstrap em API mode sem depender de auth_session", async () => {
    localStorage.clear()
    localStorage.setItem(
      "auth_user",
      JSON.stringify({
        id: "api_user",
        email: "api@test.com",
        firstName: "Api",
        lastName: "User",
        isEmailConfirmed: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        planType: "free",
      }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user?.email).toBe("api@test.com")
    expect(mocked.setContextMock).toHaveBeenCalled()
  })

  it("mapeia erro 401 para mensagem amigavel", async () => {
    mocked.apiPostMock.mockRejectedValueOnce(Object.assign(new Error("Credenciais invalidas"), { status: 401 }))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await expect(result.current.login("user@test.com", "errada")).rejects.toThrow("Email ou senha inválidos")
    })
  })

  it("mapeia erro de conectividade para mensagem amigavel", async () => {
    mocked.apiPostMock.mockRejectedValueOnce(Object.assign(new Error("Erro de conectividade com a API"), { status: 0 }))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await expect(result.current.login("user@test.com", "123456")).rejects.toThrow(
        "Não foi possível conectar com o servidor",
      )
    })
  })

  it("nao expoe erro tecnico bruto em falha inesperada de login", async () => {
    mocked.apiPostMock.mockRejectedValueOnce(
      Object.assign(new Error("Database connection failed: timeout at shard 3"), { status: 500 }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await expect(result.current.login("user@test.com", "123456")).rejects.toThrow(
        "Serviço de autenticação indisponível. Tente novamente em instantes",
      )
    })
  })

  it("faz logout via /api/auth/logout e limpa estado local", async () => {
    localStorage.setItem(
      "auth_user",
      JSON.stringify({
        id: "user_1",
        email: "user@test.com",
        firstName: "Ana",
        lastName: "Silva",
      }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    mocked.apiPostMock.mockResolvedValueOnce({ success: true })

    act(() => {
      result.current.logout()
    })

    await waitFor(() => {
      expect(mocked.apiPostMock).toHaveBeenCalledWith("/auth/logout", {})
    })

    expect(mocked.cleanupUserDataMock).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem("auth_session")).toBeNull()
    expect(localStorage.getItem("auth_user")).toBeNull()
    expect(result.current.user).toBeNull()
    expect(mocked.pushMock).toHaveBeenCalledWith("/auth")
  })

  it("mantem limpeza local mesmo com falha no /api/auth/logout", async () => {
    localStorage.setItem(
      "auth_user",
      JSON.stringify({
        id: "user_2",
        email: "fail@test.com",
        firstName: "Bia",
        lastName: "Souza",
      }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    mocked.apiPostMock.mockRejectedValueOnce(new Error("network"))

    act(() => {
      result.current.logout()
    })

    await waitFor(() => {
      expect(mocked.apiPostMock).toHaveBeenCalledWith("/auth/logout", {})
    })

    expect(mocked.cleanupUserDataMock).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem("auth_session")).toBeNull()
    expect(localStorage.getItem("auth_user")).toBeNull()
    expect(result.current.user).toBeNull()
    expect(mocked.pushMock).toHaveBeenCalledWith("/auth")
  })

  it("remove sessao expirada no bootstrap em modo local", async () => {
    mocked.useApiMode = false

    localStorage.setItem(
      "auth_session",
      JSON.stringify({
        token: "expired",
        userId: "user_exp",
        organizationId: "org_1",
        expiresAt: "2000-01-01T00:00:00.000Z",
      }),
    )
    localStorage.setItem(
      "auth_user",
      JSON.stringify({
        id: "user_exp",
        email: "expired@test.com",
        firstName: "Exp",
        lastName: "Ired",
      }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem("auth_session")).toBeNull()
    expect(localStorage.getItem("auth_user")).toBeNull()
  })
})
