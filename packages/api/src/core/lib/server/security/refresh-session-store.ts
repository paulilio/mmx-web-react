interface SessionEntry {
  userId: string
  expiresAt: number
}

const store = new Map<string, SessionEntry>()

export function persistRefreshSession(token: string, userId: string, expiresInSeconds: number): void {
  store.set(token, { userId, expiresAt: Date.now() + expiresInSeconds * 1000 })
}

export function revokeRefreshSession(token: string): void {
  store.delete(token)
}

export function isRefreshSessionValid(token: string, userId: string): boolean {
  const entry = store.get(token)
  if (!entry) return false
  if (entry.userId !== userId) return false
  if (Date.now() > entry.expiresAt) {
    store.delete(token)
    return false
  }
  return true
}

export function rotateRefreshSession(
  oldToken: string,
  newToken: string,
  userId: string,
  expiresInSeconds: number,
): void {
  store.delete(oldToken)
  store.set(newToken, { userId, expiresAt: Date.now() + expiresInSeconds * 1000 })
}
