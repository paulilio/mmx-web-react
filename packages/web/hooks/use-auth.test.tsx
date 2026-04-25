/** @vitest-environment jsdom */

import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocked = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  pushMock: vi.fn(),
  apiGetMock: vi.fn(),
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
    get: mocked.apiGetMock,
    post: mocked.apiPostMock,
  },
}))

vi.mock("@/lib/mock/user-data-service", () => ({
  userDataService: {
    setContext: mocked.setContextMock,
    cleanupUserData: mocked.cleanupUserDataMock,
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

describe("use-auth API mode", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocked.useApiMode = true
    localStorage.clear()
    mocked.apiGetMock.mockReset()
    mocked.apiPostMock.mockReset()
    // Default: bootstrap me() fails with 401 (no session yet)
    mocked.apiGetMock.mockRejectedValue(Object.assign(new Error("no session"), { status: 401 }))
  })

  it("rehidrata o usuario via /auth/me no bootstrap", async () => {
    mocked.apiGetMock.mockReset()
    mocked.apiGetMock.mockResolvedValueOnce({
      id: "api_user",
      email: "api@test.com",
      firstName: "Api",
      lastName: "User",
      isEmailConfirmed: true,
      planType: "free",
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mocked.apiGetMock).toHaveBeenCalledWith("/auth/me")
    expect(result.current.user?.email).toBe("api@test.com")
    expect(mocked.setContextMock).toHaveBeenCalled()
  })

  it("faz login via /auth/login e atualiza estado/contexto", async () => {
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
    expect(result.current.user?.email).toBe("user@test.com")
    expect(localStorage.getItem("auth_user")).toContain("user@test.com")
  })

  it("redireciona para verify-pending quando login retorna 403 EMAIL_NOT_CONFIRMED", async () => {
    mocked.apiPostMock.mockRejectedValueOnce(
      Object.assign(new Error("Confirme seu email"), { status: 403 }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await expect(result.current.login("user@test.com", "123456")).rejects.toThrow("Confirme seu email")
    })

    expect(mocked.replaceMock).toHaveBeenCalledWith(expect.stringContaining("/auth/verify-pending"))
  })

  it("mapeia erro 401 para mensagem amigavel", async () => {
    mocked.apiPostMock.mockRejectedValueOnce(
      Object.assign(new Error("Credenciais invalidas"), { status: 401 }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await expect(result.current.login("user@test.com", "errada")).rejects.toThrow("Email ou senha inválidos")
    })
  })

  it("register chama /auth/register e redireciona para verify-pending", async () => {
    mocked.apiPostMock.mockResolvedValueOnce({
      user: {
        id: "user_new",
        email: "new@test.com",
        firstName: "Novo",
        lastName: "",
      },
      requiresEmailVerification: true,
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.register({
        firstName: "Novo",
        email: "new@test.com",
        password: "senha12345",
      })
    })

    expect(mocked.apiPostMock).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({
        email: "new@test.com",
        password: "senha12345",
        firstName: "Novo",
      }),
    )
    expect(mocked.replaceMock).toHaveBeenCalledWith(expect.stringContaining("/auth/verify-pending"))
  })

  it("logout chama /auth/logout e limpa estado local", async () => {
    mocked.apiGetMock.mockReset()
    mocked.apiGetMock.mockResolvedValueOnce({
      id: "user_1",
      email: "user@test.com",
      firstName: "Ana",
      lastName: "Silva",
      isEmailConfirmed: true,
      planType: "free",
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mocked.apiPostMock.mockResolvedValueOnce({ success: true })

    await act(async () => {
      await result.current.logout()
    })

    expect(mocked.apiPostMock).toHaveBeenCalledWith("/auth/logout", {})
    expect(mocked.cleanupUserDataMock).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem("auth_user")).toBeNull()
    expect(result.current.user).toBeNull()
    expect(mocked.pushMock).toHaveBeenCalledWith("/auth")
  })

  it("mantem limpeza local mesmo com falha no /auth/logout", async () => {
    mocked.apiGetMock.mockReset()
    mocked.apiGetMock.mockResolvedValueOnce({
      id: "user_2",
      email: "fail@test.com",
      firstName: "Bia",
      lastName: "Souza",
      isEmailConfirmed: true,
      planType: "free",
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mocked.apiPostMock.mockRejectedValueOnce(new Error("network"))

    await act(async () => {
      await result.current.logout()
    })

    expect(mocked.cleanupUserDataMock).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem("auth_user")).toBeNull()
    expect(result.current.user).toBeNull()
    expect(mocked.pushMock).toHaveBeenCalledWith("/auth")
  })

  it("logoutAllDevices chama /auth/logout-all e limpa estado", async () => {
    mocked.apiGetMock.mockReset()
    mocked.apiGetMock.mockResolvedValueOnce({
      id: "user_3",
      email: "all@test.com",
      firstName: "Carla",
      lastName: "",
      isEmailConfirmed: true,
      planType: "free",
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mocked.apiPostMock.mockResolvedValueOnce({ revokedCount: 3 })

    let returned: { revokedCount: number } | undefined
    await act(async () => {
      returned = await result.current.logoutAllDevices()
    })

    expect(mocked.apiPostMock).toHaveBeenCalledWith("/auth/logout-all", {})
    expect(returned).toEqual({ revokedCount: 3 })
    expect(result.current.user).toBeNull()
    expect(mocked.pushMock).toHaveBeenCalledWith("/auth")
  })

  it("forgotPassword chama /auth/password/forgot", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mocked.apiPostMock.mockResolvedValueOnce({ success: true })
    await act(async () => {
      await result.current.forgotPassword("foo@test.com")
    })
    expect(mocked.apiPostMock).toHaveBeenCalledWith("/auth/password/forgot", { email: "foo@test.com" })
  })

  it("resetPasswordWithToken chama /auth/password/reset", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mocked.apiPostMock.mockResolvedValueOnce({ success: true })
    await act(async () => {
      await result.current.resetPasswordWithToken("tok123", "novaSenha12345")
    })
    expect(mocked.apiPostMock).toHaveBeenCalledWith("/auth/password/reset", {
      token: "tok123",
      newPassword: "novaSenha12345",
    })
  })

  it("resendConfirmation chama /auth/email/request-verification", async () => {
    mocked.apiGetMock.mockReset()
    mocked.apiGetMock.mockResolvedValueOnce({
      id: "user_pending",
      email: "pending@test.com",
      firstName: "Pen",
      lastName: "",
      isEmailConfirmed: false,
      planType: "free",
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mocked.apiPostMock.mockResolvedValueOnce({ success: true })
    await act(async () => {
      await result.current.resendConfirmation()
    })
    expect(mocked.apiPostMock).toHaveBeenCalledWith("/auth/email/request-verification", {})
  })
})
