import jwt from "jsonwebtoken"
import { authConfig } from "@/config/auth.config"
import { Scope } from "./permissions"

interface TokenPayload {
  sub: string
  email: string
  scopes?: Scope[]
  roles?: string[]
  jti?: string
}

interface TokenResult {
  token: string
  expiresInSeconds: number
}

function parseExpiresInSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/)
  if (!match) return 1800
  const value = parseInt(match[1])
  const unit = match[2]
  if (unit === "s") return value
  if (unit === "m") return value * 60
  if (unit === "h") return value * 3600
  if (unit === "d") return value * 86400
  return 1800
}

export function issueAccessToken(payload: {
  id: string
  email: string
  scopes?: Scope[]
  roles?: string[]
}): TokenResult {
  const { accessSecret, accessExpiresIn } = authConfig.jwt
  const token = jwt.sign(
    {
      sub: payload.id,
      email: payload.email,
      scopes: payload.scopes || [],
      roles: payload.roles || [],
    },
    accessSecret,
    {
      expiresIn: accessExpiresIn as jwt.SignOptions["expiresIn"],
    },
  )
  return { token, expiresInSeconds: parseExpiresInSeconds(accessExpiresIn) }
}

export function issueRefreshToken(payload: { id: string; email: string }): TokenResult {
  const { refreshSecret, refreshExpiresIn } = authConfig.jwt
  const token = jwt.sign({ sub: payload.id, email: payload.email }, refreshSecret, {
    expiresIn: refreshExpiresIn as jwt.SignOptions["expiresIn"],
  })
  return { token, expiresInSeconds: parseExpiresInSeconds(refreshExpiresIn) }
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, authConfig.jwt.accessSecret) as TokenPayload
  return decoded
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, authConfig.jwt.refreshSecret) as TokenPayload
  return decoded
}
