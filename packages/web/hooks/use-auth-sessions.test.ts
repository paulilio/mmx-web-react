import { renderHook, waitFor } from "@testing-library/react"
import { useAuthSessions } from "./use-auth-sessions"
import * as api from "@/lib/client/api"
import { useAuth } from "./use-auth"

// Mock dependencies
jest.mock("@/lib/client/api")
jest.mock("./use-auth")

const mockApi = api as jest.Mocked<typeof api>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe("useAuthSessions", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    isEmailConfirmed: true,
    createdAt: new Date().toISOString(),
    planType: "free",
  }

  const mockSessions = {
    sessions: [
      {
        id: "session-1",
        deviceFingerprint: "fingerprint-1",
        userAgent: "Chrome/120.0",
        lastIp: "192.168.1.1",
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    count: 1,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      logoutAllDevices: jest.fn(),
      resendConfirmation: jest.fn(),
      forgotPassword: jest.fn(),
      resetPasswordWithToken: jest.fn(),
      hydrateFromSession: jest.fn(),
      switchOrganization: jest.fn(),
    })
  })

  it("should fetch sessions on demand", async () => {
    mockApi.get.mockResolvedValue(mockSessions)

    const { result } = renderHook(() => useAuthSessions())

    await waitFor(() => {
      result.current.fetchSessions()
    })

    await waitFor(() => {
      expect(result.current.sessions).toEqual(mockSessions.sessions)
    })

    expect(mockApi.get).toHaveBeenCalledWith("/auth/sessions")
  })

  it("should handle fetch error", async () => {
    const error = new Error("API Error")
    mockApi.get.mockRejectedValue(error)

    const { result } = renderHook(() => useAuthSessions())

    await waitFor(() => {
      result.current.fetchSessions()
    })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })
  })

  it("should revoke a session", async () => {
    mockApi.delete.mockResolvedValue({})

    const { result } = renderHook(() => useAuthSessions())
    result.current.sessions = mockSessions.sessions

    const success = await result.current.revokeSession("session-1")

    expect(success).toBe(true)
    expect(mockApi.delete).toHaveBeenCalledWith("/auth/sessions/session-1")
  })

  it("should revoke all other sessions", async () => {
    mockApi.delete.mockResolvedValue({ revokedCount: 5 })

    const { result } = renderHook(() => useAuthSessions())

    const revokedCount = await result.current.revokeAllOthers()

    expect(revokedCount).toBe(5)
    expect(mockApi.delete).toHaveBeenCalledWith("/auth/sessions")
  })

  it("should handle not authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      logoutAllDevices: jest.fn(),
      resendConfirmation: jest.fn(),
      forgotPassword: jest.fn(),
      resetPasswordWithToken: jest.fn(),
      hydrateFromSession: jest.fn(),
      switchOrganization: jest.fn(),
    })

    const { result } = renderHook(() => useAuthSessions())

    await result.current.fetchSessions()

    expect(result.current.error).toBe("User not authenticated")
  })
})
