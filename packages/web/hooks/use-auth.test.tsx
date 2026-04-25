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

describe("use-auth OAuth-only", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocked.useApiMode = true
    localStorage.clear()
    mocked.apiGetMock.mockReset()
    mocked.apiPostMock.mockReset()
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

  it("trata 401 do /auth/me limpando estado local", async () => {
    mocked.apiGetMock.mockReset()
    mocked.apiGetMock.mockRejectedValueOnce(
      Object.assign(new Error("no session"), { status: 401 }),
    )
    localStorage.setItem("auth_user", "{}")

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem("auth_user")).toBeNull()
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
})
