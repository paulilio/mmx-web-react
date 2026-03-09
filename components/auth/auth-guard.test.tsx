/** @vitest-environment jsdom */

import { act, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocked = vi.hoisted(() => ({
  pushMock: vi.fn(),
  authState: {
    user: null as
      | {
          id: string
          email: string
          firstName: string
          lastName: string
          isEmailConfirmed: boolean
          createdAt: string
          planType: "free" | "premium" | "pro"
        }
      | null,
    isLoading: false,
  },
  sessionState: {
    isSessionValid: false,
  },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocked.pushMock,
  }),
}))

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mocked.authState,
}))

vi.mock("@/hooks/use-session", () => ({
  useSession: () => mocked.sessionState,
}))

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}))

vi.mock("lucide-react", () => ({
  TrendingUp: () => <div data-testid="trending-up" />,
}))

import { AuthGuard } from "./auth-guard"

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    mocked.authState.user = null
    mocked.authState.isLoading = false
    mocked.sessionState.isSessionValid = false
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("redireciona para /auth quando nao ha usuario", async () => {
    render(
      <AuthGuard>
        <div>conteudo protegido</div>
      </AuthGuard>,
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(110)
    })

    expect(mocked.pushMock).toHaveBeenCalledWith("/auth")
  })

  it("redireciona para confirmacao quando email nao esta confirmado", async () => {
    mocked.authState.user = {
      id: "user_1",
      email: "user@test.com",
      firstName: "Ana",
      lastName: "Silva",
      isEmailConfirmed: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      planType: "free",
    }
    mocked.sessionState.isSessionValid = true

    render(
      <AuthGuard>
        <div>conteudo protegido</div>
      </AuthGuard>,
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(110)
    })

    expect(mocked.pushMock).toHaveBeenCalledWith("/auth/confirm?email=user%40test.com")
  })

  it("mantem navegacao quando usuario e sessao sao validos", async () => {
    mocked.authState.user = {
      id: "user_1",
      email: "user@test.com",
      firstName: "Ana",
      lastName: "Silva",
      isEmailConfirmed: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      planType: "free",
    }
    mocked.sessionState.isSessionValid = true

    render(
      <AuthGuard>
        <div>conteudo protegido</div>
      </AuthGuard>,
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(110)
    })

    expect(screen.queryByText("conteudo protegido")).not.toBeNull()

    expect(mocked.pushMock).not.toHaveBeenCalled()
  })
})
