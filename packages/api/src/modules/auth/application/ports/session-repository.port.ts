export const SESSION_REPOSITORY = Symbol("SessionRepository")

export interface ISessionRepository {
  findAllByUserId(userId: string): Promise<Session[]>
  findOneById(sessionId: string): Promise<Session | null>
  revokeById(sessionId: string): Promise<void>
  revokeAllForUser(userId: string): Promise<void>
  revokeAllExcept(userId: string, keepSessionId: string): Promise<void>
  create(data: CreateSessionInput): Promise<Session>
}

export interface Session {
  id: string
  userId: string
  tokenHash: string
  deviceFingerprint?: string | null
  userAgent?: string | null
  lastIp?: string | null
  lastActivityAt: Date
  createdAt: Date
  expiresAt: Date
}

export interface CreateSessionInput {
  userId: string
  tokenHash: string
  expiresAt: Date
  deviceFingerprint?: string | null
  userAgent?: string | null
  lastIp?: string | null
}
