import type { DomainAccountStatus, DomainAccountType } from "@/modules/accounts/domain/account-entity"
import type { AccountBalance, AccountRecord } from "@/modules/accounts/domain/account.types"

export function parseAccountType(value: unknown): DomainAccountType | undefined {
  if (value == null) return undefined

  if (typeof value !== "string") {
    throw new Error("Tipo da conta invalido")
  }

  const normalized = value.trim().toLowerCase()

  if (normalized === "checking") return "CHECKING"
  if (normalized === "savings") return "SAVINGS"
  if (normalized === "credit-card" || normalized === "creditcard" || normalized === "credit_card") return "CREDIT_CARD"
  if (normalized === "investment") return "INVESTMENT"
  if (normalized === "business") return "BUSINESS"
  if (normalized === "cash") return "CASH"
  if (normalized === "other") return "OTHER"

  throw new Error("Tipo da conta invalido")
}

export function parseAccountStatus(value: unknown): DomainAccountStatus | undefined {
  if (value == null) return undefined

  if (typeof value !== "string") {
    throw new Error("Status da conta invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "ACTIVE") return "ACTIVE"
  if (normalized === "ARCHIVED") return "ARCHIVED"
  if (normalized === "PENDING_REVIEW" || normalized === "PENDING-REVIEW") return "PENDING_REVIEW"

  throw new Error("Status da conta invalido")
}

function toClientType(value: DomainAccountType): "checking" | "savings" | "credit-card" | "investment" | "business" | "cash" | "other" {
  if (value === "CHECKING") return "checking"
  if (value === "SAVINGS") return "savings"
  if (value === "CREDIT_CARD") return "credit-card"
  if (value === "INVESTMENT") return "investment"
  if (value === "BUSINESS") return "business"
  if (value === "CASH") return "cash"
  return "other"
}

function toClientStatus(value: DomainAccountStatus): "active" | "archived" | "pending-review" {
  if (value === "ACTIVE") return "active"
  if (value === "ARCHIVED") return "archived"
  return "pending-review"
}

export function mapAccount(account: AccountRecord) {
  return {
    id: account.id,
    userId: account.userId,
    name: account.name,
    institutionName: account.institutionName,
    type: toClientType(account.type),
    status: toClientStatus(account.status),
    currency: account.currency,
    openingBalance: Number(account.openingBalance),
    openingBalanceDate: account.openingBalanceDate.toISOString(),
    color: account.color,
    icon: account.icon,
    isBusiness: account.isBusiness,
    creditLimit: account.creditLimit == null ? null : Number(account.creditLimit),
    closingDay: account.closingDay,
    dueDay: account.dueDay,
    bankConnectionId: account.bankConnectionId,
    externalId: account.externalId,
    archivedAt: account.archivedAt ? account.archivedAt.toISOString() : null,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  }
}

export function mapAccountBalance(balance: AccountBalance) {
  return {
    accountId: balance.accountId,
    currency: balance.currency,
    openingBalance: Number(balance.openingBalance),
    movement: Number(balance.movement),
    currentBalance: Number(balance.currentBalance),
  }
}
