import type { Response } from "express"

const ACCESS_COOKIE = "mmx_access_token"
const REFRESH_COOKIE = "mmx_refresh_token"

function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

const BASE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false,
  path: "/",
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken?: string) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...BASE_OPTIONS,
    secure: isProduction(),
    maxAge: 30 * 60 * 1000,
  })

  if (refreshToken) {
    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...BASE_OPTIONS,
      secure: isProduction(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
  }
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { path: "/" })
  res.clearCookie(REFRESH_COOKIE, { path: "/" })
}

export function resolveRefreshTokenFromCookie(req: { cookies?: Record<string, string> }): string | null {
  return req.cookies?.[REFRESH_COOKIE] ?? null
}
