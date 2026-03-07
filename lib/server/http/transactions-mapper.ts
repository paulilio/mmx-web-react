import type { NextRequest } from "next/server"
import { resolveAuthenticatedUserId } from "../security/auth-identity"
import type {
  DomainTransactionStatus,
  DomainTransactionType,
} from "@/lib/domain/transactions/transaction-entity"

interface TransactionLikeRecord {
  id: string
  userId: string
  description: string
  amount: unknown
  type: DomainTransactionType
  categoryId: string
  contactId?: string | null
  date: Date
  status: DomainTransactionStatus
  notes?: string | null
  recurrence?: unknown
  areaId?: string | null
  categoryGroupId?: string | null
  createdAt: Date
  updatedAt: Date
}

export function resolveUserId(request: NextRequest, bodyUserId?: string): string | null {
  const authenticatedUserId = resolveAuthenticatedUserId(request)
  if (authenticatedUserId) {
    return authenticatedUserId
  }

  if (process.env.NODE_ENV !== "test") {
    return null
  }

  const queryUserId = request.nextUrl.searchParams.get("userId")
  const headerUserId = request.headers.get("x-user-id")
  return bodyUserId ?? queryUserId ?? headerUserId
}

export function parseTransactionType(value: unknown): DomainTransactionType | undefined {
  if (value == null) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error("Tipo da transacao invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "INCOME") return "INCOME"
  if (normalized === "EXPENSE") return "EXPENSE"

  throw new Error("Tipo da transacao invalido")
}

export function parseTransactionStatus(value: unknown): DomainTransactionStatus | undefined {
  if (value == null) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error("Status da transacao invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "PENDING") return "PENDING"
  if (normalized === "COMPLETED") return "COMPLETED"
  if (normalized === "CANCELLED") return "CANCELLED"

  throw new Error("Status da transacao invalido")
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function toAmount(value: unknown): number {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  if (value && typeof value === "object" && "toString" in value) {
    const parsed = Number(String(value))
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function toClientType(value: DomainTransactionType): "income" | "expense" {
  return value === "INCOME" ? "income" : "expense"
}

function toClientStatus(value: DomainTransactionStatus): "pending" | "completed" | "cancelled" {
  if (value === "PENDING") return "pending"
  if (value === "COMPLETED") return "completed"
  return "cancelled"
}

export function mapTransaction(transaction: TransactionLikeRecord) {
  return {
    id: transaction.id,
    userId: transaction.userId,
    description: transaction.description,
    amount: toAmount(transaction.amount),
    type: toClientType(transaction.type),
    categoryId: transaction.categoryId,
    contactId: transaction.contactId,
    date: toDateOnly(transaction.date),
    status: toClientStatus(transaction.status),
    notes: transaction.notes,
    recurrence: transaction.recurrence,
    areaId: transaction.areaId,
    categoryGroupId: transaction.categoryGroupId,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  }
}
