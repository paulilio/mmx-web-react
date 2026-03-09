import { describe, expect, it, vi } from "vitest"

vi.mock("./lib/server/security/cors", () => ({
  resolveRuntimeEnvironment: vi.fn(() => "development"),
  resolveCorsOriginMatrix: vi.fn(() => ({
    development: ["http://localhost:3000"],
    staging: [],
    production: [],
  })),
  evaluateCorsRequest: vi.fn(() => ({
    allowed: true,
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
    },
  })),
}))

import { middleware } from "./middleware"

function makeRequest(pathname: string, options?: { method?: string; authHeader?: string; cookieToken?: string }) {
  return {
    nextUrl: {
      pathname,
    },
    method: options?.method ?? "GET",
    headers: new Headers(options?.authHeader ? { authorization: options.authHeader } : {}),
    cookies: {
      get: (name: string) => {
        if (name === "mmx_access_token" && options?.cookieToken) {
          return { value: options.cookieToken }
        }

        return undefined
      },
    },
  }
}

describe("middleware auth for protected api", () => {
  it("retorna 401 para rota protegida sem access token", async () => {
    const response = middleware(makeRequest("/api/transactions") as never)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("AUTH_REQUIRED")
  })

  it("permite rota protegida com bearer token", () => {
    const response = middleware(makeRequest("/api/transactions", { authHeader: "Bearer token-123" }) as never)

    expect(response.status).toBe(200)
  })

  it("permite rota protegida com access token em cookie", () => {
    const response = middleware(makeRequest("/api/transactions", { cookieToken: "cookie-token-123" }) as never)

    expect(response.status).toBe(200)
  })

  it("permite rota publica de auth sem access token", () => {
    const response = middleware(makeRequest("/api/auth/login") as never)

    expect(response.status).toBe(200)
  })
})
