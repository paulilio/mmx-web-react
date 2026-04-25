export const REFRESH_SESSION_REPOSITORY = Symbol("IRefreshSessionRepository")

export interface RefreshSessionRecord {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
  revokedAt: Date | null
  createdAt: Date
}

export interface CreateRefreshSessionInput {
  userId: string
  tokenHash: string
  expiresAt: Date
  userAgent?: string | null
  ipAddress?: string | null
}

export interface IRefreshSessionRepository {
  create(input: CreateRefreshSessionInput): Promise<RefreshSessionRecord>
  findActiveByTokenHash(tokenHash: string): Promise<RefreshSessionRecord | null>
  revokeByTokenHash(tokenHash: string): Promise<void>
  revokeAllForUser(userId: string): Promise<number>
  deleteExpired(): Promise<number>
}
