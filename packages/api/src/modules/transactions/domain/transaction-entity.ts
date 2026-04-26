export type DomainTransactionType = "INCOME" | "EXPENSE"
export type DomainTransactionStatus = "COMPLETED" | "PENDING" | "CANCELLED"

import {
  ensureExpenseWithinBalance,
  validateAmount,
  validateRequiredFields,
  validateStatusTransition,
  validateTransactionDate,
} from "./transaction-rules"

export interface TransactionEntityProps {
  userId: string
  description: string
  amount: number
  type: DomainTransactionType
  categoryId: string
  date: Date
  status: DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
  recurrence?: unknown
}

export interface CreateTransactionEntityInput {
  userId: string
  description: string
  amount: number
  type: DomainTransactionType
  categoryId: string
  date: string
  status?: DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
  recurrence?: unknown
}

export interface UpdateTransactionEntityInput {
  description?: string
  amount?: number
  type?: DomainTransactionType
  categoryId?: string
  date?: string
  status?: DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
  recurrence?: unknown
}

export interface TransactionEntityUpdatePayload {
  description?: string
  amount?: number
  type?: DomainTransactionType
  categoryId?: string
  date?: Date
  status?: DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
  recurrence?: unknown
}

export class TransactionEntity {
  constructor(private readonly props: TransactionEntityProps) {}

  static create(
    input: CreateTransactionEntityInput,
    currentBalance?: number,
  ): TransactionEntity {
    const parsedDate = new Date(input.date)

    validateRequiredFields({
      userId: input.userId,
      categoryId: input.categoryId,
      description: input.description,
    })
    validateAmount(input.amount)
    validateTransactionDate(parsedDate)
    ensureExpenseWithinBalance(input.type, input.amount, currentBalance)

    return new TransactionEntity({
      userId: input.userId,
      description: input.description,
      amount: input.amount,
      type: input.type,
      categoryId: input.categoryId,
      date: parsedDate,
      status: input.status ?? "PENDING",
      notes: input.notes,
      contactId: input.contactId,
      areaId: input.areaId,
      categoryGroupId: input.categoryGroupId,
      recurrence: input.recurrence,
    })
  }

  static fromRecord(record: TransactionEntityProps): TransactionEntity {
    return new TransactionEntity(record)
  }

  get value(): TransactionEntityProps {
    return this.props
  }

  buildUpdatePayload(
    input: UpdateTransactionEntityInput,
    currentBalance?: number,
  ): TransactionEntityUpdatePayload {
    if (typeof input.amount === "number") {
      validateAmount(input.amount)
    }

    if (typeof input.date === "string") {
      validateTransactionDate(new Date(input.date))
    }

    if (input.status) {
      validateStatusTransition(this.props.status, input.status)
    }

    const nextType = input.type ?? this.props.type
    const nextAmount = input.amount ?? this.props.amount
    ensureExpenseWithinBalance(nextType, nextAmount, currentBalance)

    return {
      description: input.description,
      amount: input.amount,
      type: input.type,
      categoryId: input.categoryId,
      date: input.date ? new Date(input.date) : undefined,
      status: input.status,
      notes: input.notes,
      contactId: input.contactId,
      areaId: input.areaId,
      categoryGroupId: input.categoryGroupId,
      recurrence: input.recurrence,
    }
  }
}
