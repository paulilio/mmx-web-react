import type { DomainAccountStatus, DomainAccountType } from "./account-entity"

export type { DomainAccountStatus, DomainAccountType }

export interface AccountRecord {
  id: string
  userId: string
  name: string
  institutionName?: string | null
  type: DomainAccountType
  status: DomainAccountStatus
  currency: string
  openingBalance: number
  openingBalanceDate: Date
  color?: string | null
  icon?: string | null
  isBusiness: boolean
  creditLimit?: number | null
  closingDay?: number | null
  dueDay?: number | null
  bankConnectionId?: string | null
  externalId?: string | null
  archivedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateAccountRecordInput {
  userId: string
  name: string
  institutionName?: string | null
  type: DomainAccountType
  status: DomainAccountStatus
  currency: string
  openingBalance: number
  openingBalanceDate: Date
  color?: string | null
  icon?: string | null
  isBusiness: boolean
  creditLimit?: number | null
  closingDay?: number | null
  dueDay?: number | null
  bankConnectionId?: string | null
  externalId?: string | null
}

export interface UpdateAccountRecordInput {
  name?: string
  institutionName?: string | null
  type?: DomainAccountType
  status?: DomainAccountStatus
  currency?: string
  openingBalance?: number
  openingBalanceDate?: Date
  color?: string | null
  icon?: string | null
  isBusiness?: boolean
  creditLimit?: number | null
  closingDay?: number | null
  dueDay?: number | null
  archivedAt?: Date | null
}

export interface AccountFilters {
  userId: string
  type?: DomainAccountType
  status?: DomainAccountStatus
}

export interface AccountBalance {
  accountId: string
  currency: string
  openingBalance: number
  movement: number
  currentBalance: number
}
