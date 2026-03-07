import { NextResponse } from "next/server"
import { describe, expect, it } from "vitest"
import { clearAuthCookies, setAuthCookies } from "./auth-cookies"

describe("auth-cookies", () => {
  it("define access and refresh cookies", () => {
    const response = NextResponse.json({ data: true })
    setAuthCookies(response, "at_test", "rt_test")

    expect(response.cookies.get("mmx_access_token")?.value).toBe("at_test")
    expect(response.cookies.get("mmx_refresh_token")?.value).toBe("rt_test")
  })

  it("remove auth cookies", () => {
    const response = NextResponse.json({ data: true })
    setAuthCookies(response, "at_test", "rt_test")
    clearAuthCookies(response)

    expect(response.cookies.get("mmx_access_token")?.value).toBe("")
    expect(response.cookies.get("mmx_refresh_token")?.value).toBe("")
  })
})
