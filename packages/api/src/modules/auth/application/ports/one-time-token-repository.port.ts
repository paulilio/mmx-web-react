export const ONE_TIME_TOKEN_REPOSITORY = Symbol("IOneTimeTokenRepository")

export type OneTimeTokenPurposeValue = "EMAIL_VERIFY" | "PASSWORD_RESET"

export interface OneTimeTokenRecord {
  id: string
  userId: string
  tokenHash: string
  purpose: OneTimeTokenPurposeValue
  expiresAt: Date
  consumedAt: Date | null
  createdAt: Date
}

export interface CreateOneTimeTokenInput {
  userId: string
  tokenHash: string
  purpose: OneTimeTokenPurposeValue
  expiresAt: Date
  ipAddress?: string | null
}

export interface IOneTimeTokenRepository {
  create(input: CreateOneTimeTokenInput): Promise<OneTimeTokenRecord>
  findActiveByHash(tokenHash: string, purpose: OneTimeTokenPurposeValue): Promise<OneTimeTokenRecord | null>
  consume(id: string): Promise<void>
  invalidatePending(userId: string, purpose: OneTimeTokenPurposeValue): Promise<number>
}
