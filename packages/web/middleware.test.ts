import { describe, expect, it } from "vitest"

import { middleware } from "./middleware"

function makeRequest(pathname: string, options?: { method?: string }) {
  return {
    nextUrl: {
      pathname,
    },
    method: options?.method ?? "GET",
    headers: new Headers(),
    cookies: {
      get: () => undefined,
    },
  }
}

describe("middleware", () => {
  it("aplica headers de seguranca em rotas da aplicacao", () => {
    const response = middleware(makeRequest("/dashboard") as never)

    expect(response.status).toBe(200)
    expect(response.headers.get("X-Frame-Options")).toBe("DENY")
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff")
  })

  it("permite rotas publicas de auth com headers de seguranca", () => {
    const response = middleware(makeRequest("/auth/login") as never)

    expect(response.status).toBe(200)
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin")
  })
})
