import { randomUUID } from "crypto"
import jwt, { type SignOptions } from "jsonwebtoken"

type TokenType = "access" | "refresh"

export interface AuthTokenUser {
  id: string
  email: string
}

export interface JwtPayload {
  sub: string
  email: string
  type: TokenType
  jti: string
  iat: number
  exp: number
}

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? "30m"
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d"

function getAccessSecret(): string {
  return process.env.JWT_ACCESS_SECRET ?? "mmx_dev_access_secret_change_me"
}

function getRefreshSecret(): string {
  return process.env.JWT_REFRESH_SECRET ?? "mmx_dev_refresh_secret_change_me"
}

function parseExpiryToSeconds(expiry: string): number {
  const normalized = expiry.trim().toLowerCase()
  const match = normalized.match(/^(\d+)([smhd])$/)

  if (!match) {
    const asNumber = Number(normalized)
    return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : 30 * 60
  }

  const value = Number(match[1])
  const unit = match[2]

  if (unit === "s") return value
  if (unit === "m") return value * 60
  if (unit === "h") return value * 60 * 60
  return value * 24 * 60 * 60
}

function signToken(user: AuthTokenUser, type: TokenType, secret: string, expiresIn: string): string {
  const signOptions: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
    jwtid: randomUUID(),
    subject: user.id,
  }

  return jwt.sign(
    {
      email: user.email,
      type,
    },
    secret,
    signOptions,
  )
}

function normalizePayload(payload: unknown, expectedType: TokenType): JwtPayload {
  if (!payload || typeof payload !== "object") {
    throw new Error("Token invalido")
  }

  const casted = payload as Partial<JwtPayload>

  if (!casted.sub || !casted.email || !casted.jti || !casted.type || !casted.exp || !casted.iat) {
    throw new Error("Token invalido")
  }

  if (casted.type !== expectedType) {
    throw new Error("Tipo de token invalido")
  }

  return casted as JwtPayload
}

export function issueAccessToken(user: AuthTokenUser): { token: string; expiresInSeconds: number } {
  const token = signToken(user, "access", getAccessSecret(), ACCESS_EXPIRES_IN)
  return {
    token,
    expiresInSeconds: parseExpiryToSeconds(ACCESS_EXPIRES_IN),
  }
}

export function issueRefreshToken(user: AuthTokenUser): { token: string; expiresInSeconds: number } {
  const token = signToken(user, "refresh", getRefreshSecret(), REFRESH_EXPIRES_IN)
  return {
    token,
    expiresInSeconds: parseExpiryToSeconds(REFRESH_EXPIRES_IN),
  }
}

export function verifyAccessToken(token: string): JwtPayload {
  const payload = jwt.verify(token, getAccessSecret())
  return normalizePayload(payload, "access")
}

export function verifyRefreshToken(token: string): JwtPayload {
  const payload = jwt.verify(token, getRefreshSecret())
  return normalizePayload(payload, "refresh")
}
