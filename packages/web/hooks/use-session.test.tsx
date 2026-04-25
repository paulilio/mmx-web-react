/** @vitest-environment jsdom */

import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocked = vi.hoisted(() => ({
  pushMock: vi.fn(),
  apiPostMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastWarningMock: vi.fn(),
  logAuditEventMock: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocked.pushMock,
  }),
  usePathname: () => "/dashboard",
}))

vi.mock("@/lib/shared/config", () => ({
  USE_API: true,
}))

vi.mock("@/lib/client/api", () => ({
  api: {
    post: mocked.apiPostMock,
  },
}))

vi.mock("sonner", () => ({
  toast: {
    error: mocked.toastErrorMock,
    warning: mocked.toastWarningMock,
  },
}))

vi.mock("@/lib/shared/utils", () => ({
  logAuditEvent: mocked.logAuditEventMock,
}))

import { useSession } from "./use-session"

describe("use-session refresh API mode", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem("auth_user", JSON.stringify({ id: "user_1", email: "user@test.com" }))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renova sessao no bootstrap quando nao existe auth_session local", async () => {
    mocked.apiPostMock.mockResolvedValueOnce({
      accessToken: "access",
      refreshToken: "refresh",
      expiresIn: 900,
    })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(mocked.apiPostMock).toHaveBeenCalledWith("/auth/refresh", {})
    })

    await waitFor(() => {
      expect(result.current.isSessionValid).toBe(true)
      expect(result.current.sessionData?.userId).toBe("user_1")
      expect(result.current.sessionData?.token).toBe("cookie-session")
      expect(result.current.timeUntilExpiry).not.toBeNull()
    })
  })

  it("refreshSession atualiza o prazo da sessao", async () => {
    mocked.apiPostMock.mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
      expiresIn: 120,
    })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.isSessionValid).toBe(true)
    })

    const previousExpiry = result.current.sessionData?.expiresAt

    await act(async () => {
      await result.current.refreshSession()
    })

    expect(mocked.apiPostMock).toHaveBeenCalledWith("/auth/refresh", {})
    expect(result.current.sessionData?.expiresAt).not.toBe(previousExpiry)
    expect(result.current.isSessionValid).toBe(true)
  })

  it("faz logout local e redireciona quando refresh falha com 401", async () => {
    mocked.apiPostMock
      .mockResolvedValueOnce({
        accessToken: "access",
        refreshToken: "refresh",
        expiresIn: 60,
      })
      .mockRejectedValueOnce(Object.assign(new Error("invalid"), { status: 401 }))

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.isSessionValid).toBe(true)
    })

    await act(async () => {
      await result.current.refreshSession()
    })

    expect(result.current.isSessionValid).toBe(false)
    expect(result.current.sessionData).toBeNull()
    expect(localStorage.getItem("auth_user")).toBeNull()
    expect(mocked.toastErrorMock).toHaveBeenCalledWith("Sessão expirada. Faça login novamente.")
    expect(mocked.pushMock).toHaveBeenCalledWith("/auth")
  })

  it("exibe aviso amigavel quando refresh retorna 429", async () => {
    mocked.apiPostMock
      .mockResolvedValueOnce({
        accessToken: "access",
        refreshToken: "refresh",
        expiresIn: 60,
      })
      .mockRejectedValueOnce(Object.assign(new Error("rate-limited"), { status: 429 }))

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.isSessionValid).toBe(true)
    })

    await act(async () => {
      await result.current.refreshSession()
    })

    expect(result.current.isSessionValid).toBe(false)
    expect(result.current.sessionData).toBeNull()
    expect(localStorage.getItem("auth_user")).toBeNull()
    expect(mocked.toastWarningMock).toHaveBeenCalledWith("Muitas tentativas de renovação. Tente novamente em instantes")
    expect(mocked.toastErrorMock).not.toHaveBeenCalled()
    expect(mocked.pushMock).not.toHaveBeenCalled()
  })
})
