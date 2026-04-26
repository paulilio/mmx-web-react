import type { DomainTransactionType, DomainTransactionStatus } from "@/modules/transactions/domain/transaction-entity"

interface TransactionLikeRecord {
  id: string
  userId: string
  description: string
  amount: number | string | { toNumber(): number }
  type: DomainTransactionType
  categoryId: string
  contactId?: string | null
  date: Date
  status: DomainTransactionStatus
  notes?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
  recurrence?: unknown
  templateId?: string | null
  seriesIndex?: number | null
  skipped?: boolean
  isException?: boolean
  createdAt: Date
  updatedAt: Date
}

export function parseTransactionType(value: unknown): DomainTransactionType | undefined {
  if (value == null) return undefined

  if (typeof value !== "string") throw new Error("Tipo da transacao invalido")

  const normalized = value.trim().toUpperCase()

  if (normalized === "INCOME") return "INCOME"
  if (normalized === "EXPENSE") return "EXPENSE"

  throw new Error("Tipo da transacao invalido")
}

export function parseTransactionStatus(value: unknown): DomainTransactionStatus | undefined {
  if (value == null) return undefined

  if (typeof value !== "string") throw new Error("Status da transacao invalido")

  const normalized = value.trim().toUpperCase()

  if (normalized === "COMPLETED") return "COMPLETED"
  if (normalized === "PENDING") return "PENDING"
  if (normalized === "CANCELLED") return "CANCELLED"

  throw new Error("Status da transacao invalido")
}

function toClientType(value: DomainTransactionType): "income" | "expense" {
  return value === "INCOME" ? "income" : "expense"
}

function toClientStatus(value: DomainTransactionStatus): "completed" | "pending" | "cancelled" {
  if (value === "COMPLETED") return "completed"
  if (value === "PENDING") return "pending"
  return "cancelled"
}

function toNumber(value: number | string | { toNumber(): number }): number {
  if (typeof value === "number") return value
  if (typeof value === "string") return parseFloat(value)
  return value.toNumber()
}

export function mapTransaction(record: TransactionLikeRecord) {
  return {
    id: record.id,
    userId: record.userId,
    description: record.description,
    amount: toNumber(record.amount),
    type: toClientType(record.type),
    categoryId: record.categoryId,
    contactId: record.contactId ?? null,
    date: record.date.toISOString(),
    status: toClientStatus(record.status),
    notes: record.notes ?? null,
    areaId: record.areaId ?? null,
    categoryGroupId: record.categoryGroupId ?? null,
    recurrence: record.recurrence ?? null,
    templateId: record.templateId ?? null,
    seriesIndex: record.seriesIndex ?? null,
    skipped: record.skipped ?? false,
    isException: record.isException ?? false,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}
