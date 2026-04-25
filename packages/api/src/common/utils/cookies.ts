import type { Response } from "express"

const ACCESS_COOKIE = "mmx_access_token"
const REFRESH_COOKIE = "mmx_refresh_token"

function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

function baseOptions() {
  return {
    httpOnly: true,
    sameSite: (isProduction() ? "none" : "lax") as "none" | "lax",
    secure: isProduction(),
    path: "/",
  }
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken?: string) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseOptions(),
    maxAge: 30 * 60 * 1000,
  })

  if (refreshToken) {
    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...baseOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
  }
}

export function clearAuthCookies(res: Response) {
  const opts = baseOptions()
  res.clearCookie(ACCESS_COOKIE, { path: opts.path, sameSite: opts.sameSite, secure: opts.secure })
  res.clearCookie(REFRESH_COOKIE, { path: opts.path, sameSite: opts.sameSite, secure: opts.secure })
}

export function resolveRefreshTokenFromCookie(req: { cookies?: Record<string, string> }): string | null {
  return req.cookies?.[REFRESH_COOKIE] ?? null
}
