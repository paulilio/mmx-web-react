import type { NextResponse } from "next/server"

const ACCESS_TOKEN_COOKIE = "mmx_access_token"
const REFRESH_TOKEN_COOKIE = "mmx_refresh_token"

function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken?: string) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: 30 * 60,
  })

  if (refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction(),
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })
  }

  return response
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE)
  response.cookies.delete(REFRESH_TOKEN_COOKIE)
  return response
}
