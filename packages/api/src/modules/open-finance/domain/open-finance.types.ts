// Provider-agnostic types used by the OpenFinanceProvider port.
// Adapters (e.g. Belvo) translate between their proprietary shape and these.

export type ProviderName = "belvo" | "pluggy" | "klavi"

export interface ProviderLink {
  externalId: string
  institutionCode: string
  status: "valid" | "invalid" | "expired" | "revoked"
  consentExpiresAt?: Date
  createdAt: Date
}

export interface ProviderAccount {
  externalId: string
  name: string
  type: string
  category: string
  currency: string
  balanceCurrent?: number
  balanceAvailable?: number
}

export interface ProviderTransaction {
  externalId: string
  accountExternalId: string
  amount: number
  currency: string
  occurredAt: Date
  description: string
  observations?: string
  merchantName?: string
  categoryHint?: string
  type: "INFLOW" | "OUTFLOW"
}

export interface ProviderBill {
  externalId: string
  accountExternalId: string
  amount: number
  currency: string
  billingDate: Date
  dueDate: Date
  description: string
  status?: string
}

export interface ProviderOwner {
  displayName: string
  email?: string
  phone?: string
  documentId?: string
  documentType?: string
}

export interface ProviderWidgetTokenInput {
  externalUserId: string
  cpf?: string
  fullName?: string
}

export interface ProviderWidgetTokenOutput {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
