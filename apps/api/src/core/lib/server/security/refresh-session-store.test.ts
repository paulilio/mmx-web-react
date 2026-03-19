import { beforeEach, describe, expect, it } from "vitest"
import {
  clearRefreshSessionsForTests,
  isRefreshSessionValid,
  persistRefreshSession,
  revokeRefreshSession,
  rotateRefreshSession,
} from "./refresh-session-store"

describe("refresh-session-store", () => {
  beforeEach(() => {
    clearRefreshSessionsForTests()
  })

  it("valida sessao persistida", () => {
    persistRefreshSession("token-1", "user-1", 60)

    expect(isRefreshSessionValid("token-1", "user-1")).toBe(true)
  })

  it("invalida sessao revogada", () => {
    persistRefreshSession("token-1", "user-1", 60)
    revokeRefreshSession("token-1")

    expect(isRefreshSessionValid("token-1", "user-1")).toBe(false)
  })

  it("rotaciona sessao de refresh", () => {
    persistRefreshSession("token-1", "user-1", 60)
    rotateRefreshSession("token-1", "token-2", "user-1", 60)

    expect(isRefreshSessionValid("token-1", "user-1")).toBe(false)
    expect(isRefreshSessionValid("token-2", "user-1")).toBe(true)
  })
})
