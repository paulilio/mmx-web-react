export const OAUTH_ACCOUNT_REPOSITORY = Symbol("IOAuthAccountRepository")

export type OAuthProviderValue = "GOOGLE" | "MICROSOFT"

export interface OAuthAccountRecord {
  id: string
  userId: string
  provider: OAuthProviderValue
  providerAccountId: string
  createdAt: Date
}

export interface CreateOAuthAccountInput {
  userId: string
  provider: OAuthProviderValue
  providerAccountId: string
}

export interface IOAuthAccountRepository {
  findByProviderAccount(provider: OAuthProviderValue, providerAccountId: string): Promise<OAuthAccountRecord | null>
  create(input: CreateOAuthAccountInput): Promise<OAuthAccountRecord>
  listForUser(userId: string): Promise<OAuthAccountRecord[]>
}
