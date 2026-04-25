import type { Response } from "express"

const ACCESS_COOKIE = "mmx_access_token"
const REFRESH_COOKIE = "mmx_refresh_token"

function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

function cookieDomain(): string | undefined {
  // COOKIE_DOMAIN com ponto inicial (ex: ".moedamix.com.br") permite que o cookie
  // setado por api.* seja enviado também por requisições originadas em app.* — mesmo
  // em browsers com bloqueio agressivo de third-party (Brave, Safari, Chrome strict).
  // Vazio (default) = host-only (cookie só vale pro host exato).
  const value = process.env.COOKIE_DOMAIN?.trim()
  return value && value.length > 0 ? value : undefined
}

function baseOptions() {
  const domain = cookieDomain()
  return {
    httpOnly: true,
    sameSite: (isProduction() ? "none" : "lax") as "none" | "lax",
    secure: isProduction(),
    path: "/",
    ...(domain ? { domain } : {}),
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
  res.clearCookie(ACCESS_COOKIE, opts)
  res.clearCookie(REFRESH_COOKIE, opts)
}

export function resolveRefreshTokenFromCookie(req: { cookies?: Record<string, string> }): string | null {
  return req.cookies?.[REFRESH_COOKIE] ?? null
}
