import {
  enforceTypeSpecificFields,
  normalizeAccountStatus,
  normalizeAccountType,
  validateAccountName,
  validateCurrency,
  validateOpeningBalanceDate,
} from "./account-rules"

export type DomainAccountType =
  | "CHECKING"
  | "SAVINGS"
  | "CREDIT_CARD"
  | "INVESTMENT"
  | "BUSINESS"
  | "CASH"
  | "OTHER"

export type DomainAccountStatus = "ACTIVE" | "ARCHIVED" | "PENDING_REVIEW"

export interface AccountEntityProps {
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
}

export interface CreateAccountEntityInput {
  userId: string
  name: string
  institutionName?: string | null
  type: string
  status?: string
  currency?: string
  openingBalance?: number
  openingBalanceDate?: Date | string
  color?: string | null
  icon?: string | null
  creditLimit?: number | null
  closingDay?: number | null
  dueDay?: number | null
  bankConnectionId?: string | null
  externalId?: string | null
}

export interface UpdateAccountEntityInput {
  name?: string
  institutionName?: string | null
  type?: string
  status?: string
  currency?: string
  openingBalance?: number
  openingBalanceDate?: Date | string
  color?: string | null
  icon?: string | null
  creditLimit?: number | null
  closingDay?: number | null
  dueDay?: number | null
}

export interface AccountEntityUpdatePayload {
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

function coerceDate(value: Date | string | undefined, fallback?: Date): Date {
  if (value instanceof Date) return value
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value)
    if (!isNaN(parsed.getTime())) return parsed
  }
  if (fallback) return fallback
  return new Date()
}

export class AccountEntity {
  constructor(private readonly props: AccountEntityProps) {}

  static create(input: CreateAccountEntityInput): AccountEntity {
    validateAccountName(input.name)

    const type = normalizeAccountType(input.type)
    const status = input.status ? normalizeAccountStatus(input.status) : "ACTIVE"
    const currency = (input.currency ?? "BRL").trim().toUpperCase()
    validateCurrency(currency)

    const openingBalance = input.openingBalance ?? 0
    const openingBalanceDate = coerceDate(input.openingBalanceDate, new Date())
    validateOpeningBalanceDate(openingBalanceDate)

    enforceTypeSpecificFields(type, {
      creditLimit: input.creditLimit ?? null,
      closingDay: input.closingDay ?? null,
      dueDay: input.dueDay ?? null,
    })

    return new AccountEntity({
      userId: input.userId,
      name: input.name.trim(),
      institutionName: input.institutionName?.trim() || null,
      type,
      status,
      currency,
      openingBalance,
      openingBalanceDate,
      color: input.color?.trim() || null,
      icon: input.icon?.trim() || null,
      isBusiness: type === "BUSINESS",
      creditLimit: input.creditLimit ?? null,
      closingDay: input.closingDay ?? null,
      dueDay: input.dueDay ?? null,
      bankConnectionId: input.bankConnectionId ?? null,
      externalId: input.externalId ?? null,
      archivedAt: null,
    })
  }

  static fromRecord(record: AccountEntityProps): AccountEntity {
    return new AccountEntity(record)
  }

  get value(): AccountEntityProps {
    return this.props
  }

  buildUpdatePayload(input: UpdateAccountEntityInput): AccountEntityUpdatePayload {
    const nextType = input.type ? normalizeAccountType(input.type) : this.props.type
    const nextStatus = input.status ? normalizeAccountStatus(input.status) : undefined

    if (input.name != null) {
      validateAccountName(input.name)
    }

    let nextCurrency: string | undefined
    if (input.currency != null) {
      nextCurrency = input.currency.trim().toUpperCase()
      validateCurrency(nextCurrency)
    }

    let nextOpeningBalanceDate: Date | undefined
    if (input.openingBalanceDate != null) {
      nextOpeningBalanceDate = coerceDate(input.openingBalanceDate)
      validateOpeningBalanceDate(nextOpeningBalanceDate)
    }

    const nextCreditLimit = input.creditLimit !== undefined ? input.creditLimit : this.props.creditLimit ?? null
    const nextClosingDay = input.closingDay !== undefined ? input.closingDay : this.props.closingDay ?? null
    const nextDueDay = input.dueDay !== undefined ? input.dueDay : this.props.dueDay ?? null

    enforceTypeSpecificFields(nextType, {
      creditLimit: nextCreditLimit,
      closingDay: nextClosingDay,
      dueDay: nextDueDay,
    })

    return {
      name: input.name?.trim(),
      institutionName: input.institutionName === undefined ? undefined : input.institutionName?.trim() || null,
      type: input.type ? nextType : undefined,
      status: nextStatus,
      currency: nextCurrency,
      openingBalance: input.openingBalance,
      openingBalanceDate: nextOpeningBalanceDate,
      color: input.color === undefined ? undefined : input.color?.trim() || null,
      icon: input.icon === undefined ? undefined : input.icon?.trim() || null,
      isBusiness: input.type ? nextType === "BUSINESS" : undefined,
      creditLimit: input.creditLimit !== undefined ? input.creditLimit ?? null : input.type ? nextCreditLimit : undefined,
      closingDay: input.closingDay !== undefined ? input.closingDay ?? null : input.type ? nextClosingDay : undefined,
      dueDay: input.dueDay !== undefined ? input.dueDay ?? null : input.type ? nextDueDay : undefined,
    }
  }

  archive(): AccountEntityUpdatePayload {
    return {
      status: "ARCHIVED",
      archivedAt: new Date(),
    }
  }
}
