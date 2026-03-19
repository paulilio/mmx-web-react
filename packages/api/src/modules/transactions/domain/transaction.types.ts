export type {
  DomainTransactionType,
  DomainTransactionStatus,
} from "./transaction-entity"

export interface TransactionRecord {
  id: string
  userId: string
  description: string
  amount: number | string | import("@prisma/client").Prisma.Decimal
  type: import("./transaction-entity").DomainTransactionType
  categoryId: string
  contactId?: string | null
  date: Date
  status: import("./transaction-entity").DomainTransactionStatus
  notes?: string | null
  recurrence?: unknown
  areaId?: string | null
  categoryGroupId?: string | null
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateTransactionRecordInput {
  userId: string
  description: string
  amount: number
  type: import("./transaction-entity").DomainTransactionType
  categoryId: string
  date: Date
  status: import("./transaction-entity").DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
}

export interface UpdateTransactionRecordInput {
  description?: string
  amount?: number
  type?: import("./transaction-entity").DomainTransactionType
  categoryId?: string
  date?: Date
  status?: import("./transaction-entity").DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
}

export interface TransactionFilters {
  userId: string
  status?: import("./transaction-entity").DomainTransactionStatus
  type?: import("./transaction-entity").DomainTransactionType
  categoryId?: string
  dateFrom?: string
  dateTo?: string
}

export interface TransactionSummaryGroupRecord {
  type: import("./transaction-entity").DomainTransactionType
  status: import("./transaction-entity").DomainTransactionStatus
  totalAmount: number
}

export interface TransactionAgingGroupRecord {
  date: Date
  status: import("./transaction-entity").DomainTransactionStatus
  totalAmount: number
}

export interface TransactionCashflowGroupRecord {
  date: Date
  type: import("./transaction-entity").DomainTransactionType
  status: import("./transaction-entity").DomainTransactionStatus
  totalAmount: number
}

export type CashflowStatusFilter = "all" | "completed" | "pending" | "cancelled"
