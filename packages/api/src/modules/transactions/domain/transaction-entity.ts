export type DomainTransactionType = "INCOME" | "EXPENSE" | "TRANSFER"
export type DomainTransactionStatus = "COMPLETED" | "PENDING" | "CANCELLED"
export type DomainTransferRole = "DEBIT" | "CREDIT"

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
  categoryId: string | null
  date: Date
  status: DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
  accountId: string
  transferGroupId?: string | null
  transferRole?: DomainTransferRole | null
  transferKind?: string | null
  recurrence?: unknown
}

export interface CreateTransactionEntityInput {
  userId: string
  description: string
  amount: number
  type: DomainTransactionType
  categoryId?: string | null
  date: string
  status?: DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
  accountId: string
  transferGroupId?: string | null
  transferRole?: DomainTransferRole | null
  transferKind?: string | null
  recurrence?: unknown
  /** When the target account is a credit card; bypasses balance validation. */
  accountIsCreditCard?: boolean
}

export interface UpdateTransactionEntityInput {
  description?: string
  amount?: number
  type?: DomainTransactionType
  categoryId?: string | null
  date?: string
  status?: DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
  accountId?: string
  recurrence?: unknown
  accountIsCreditCard?: boolean
}

export interface TransactionEntityUpdatePayload {
  description?: string
  amount?: number
  type?: DomainTransactionType
  categoryId?: string | null
  date?: Date
  status?: DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
  accountId?: string
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
      categoryId: input.categoryId ?? null,
      description: input.description,
      type: input.type,
      accountId: input.accountId,
    })
    validateAmount(input.amount)
    validateTransactionDate(parsedDate)

    // Cartao de credito nao valida saldo (divida e' valida ate creditLimit, Phase 4)
    if (!input.accountIsCreditCard && input.type === "EXPENSE") {
      ensureExpenseWithinBalance(input.type, input.amount, currentBalance)
    }

    return new TransactionEntity({
      userId: input.userId,
      description: input.description,
      amount: input.amount,
      type: input.type,
      categoryId: input.categoryId ?? null,
      date: parsedDate,
      status: input.status ?? "PENDING",
      notes: input.notes,
      contactId: input.contactId,
      areaId: input.areaId,
      categoryGroupId: input.categoryGroupId,
      accountId: input.accountId,
      transferGroupId: input.transferGroupId ?? null,
      transferRole: input.transferRole ?? null,
      transferKind: input.transferKind ?? null,
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
    if (!input.accountIsCreditCard && nextType === "EXPENSE") {
      ensureExpenseWithinBalance(nextType, nextAmount, currentBalance)
    }

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
      accountId: input.accountId,
      recurrence: input.recurrence,
    }
  }
}
