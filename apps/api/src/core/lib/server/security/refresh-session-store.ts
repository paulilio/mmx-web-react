import { createHash } from "crypto"

interface RefreshSession {
  userId: string
  expiresAt: number
  revokedAt?: number
}

const refreshSessions = new Map<string, RefreshSession>()

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

function nowMs(): number {
  return Date.now()
}

export function persistRefreshSession(token: string, userId: string, expiresInSeconds: number): void {
  const key = hashToken(token)
  refreshSessions.set(key, {
    userId,
    expiresAt: nowMs() + expiresInSeconds * 1000,
  })
}

export function isRefreshSessionValid(token: string, userId: string): boolean {
  const key = hashToken(token)
  const session = refreshSessions.get(key)

  if (!session) return false
  if (session.userId !== userId) return false
  if (session.revokedAt) return false
  if (session.expiresAt <= nowMs()) return false

  return true
}

export function revokeRefreshSession(token: string): void {
  const key = hashToken(token)
  const session = refreshSessions.get(key)

  if (!session) return

  refreshSessions.set(key, {
    ...session,
    revokedAt: nowMs(),
  })
}

export function rotateRefreshSession(
  currentToken: string,
  nextToken: string,
  userId: string,
  nextExpiresInSeconds: number,
): void {
  revokeRefreshSession(currentToken)
  persistRefreshSession(nextToken, userId, nextExpiresInSeconds)
}

export function clearRefreshSessionsForTests(): void {
  refreshSessions.clear()
}
