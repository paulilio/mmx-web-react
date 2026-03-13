import {
  TransactionEntity,
  type CreateTransactionEntityInput,
  type TransactionEntityProps,
  type UpdateTransactionEntityInput,
} from "@/lib/domain/transactions/transaction-entity"
import type { PaginatedResult } from "@/lib/server/repositories/base-repository"
import type {
  TransactionFilters,
  TransactionRecord,
  TransactionRepository,
  UpdateTransactionRecordInput,
} from "@/lib/server/repositories/transaction-repository"
import type { LedgerEventService } from "./ledger-event-service"

type CreateTransactionInput = CreateTransactionEntityInput
type UpdateTransactionInput = UpdateTransactionEntityInput

function toEntityProps(record: TransactionRecord): TransactionEntityProps {
  return {
    userId: record.userId,
    description: record.description,
    amount: Number(record.amount),
    type: record.type,
    categoryId: record.categoryId,
    date: record.date,
    status: record.status,
    notes: record.notes,
    contactId: record.contactId,
    areaId: record.areaId,
    categoryGroupId: record.categoryGroupId,
  }
}

export class TransactionService {
  constructor(
    private readonly repository: TransactionRepository,
    private readonly ledgerEventService?: LedgerEventService,
  ) {}

  private async recordEventSafely(input: {
    userId: string
    eventType: string
    entityId: string
    payload?: unknown
  }) {
    if (!this.ledgerEventService) {
      return
    }

    try {
      await this.ledgerEventService.record({
        userId: input.userId,
        eventType: input.eventType,
        entityType: "transaction",
        entityId: input.entityId,
        payload: input.payload,
      })
    } catch (error) {
      console.error("[ledger-events] Falha ao registrar evento de transacao", {
        eventType: input.eventType,
        entityId: input.entityId,
        userId: input.userId,
        error,
      })
    }
  }

  async list(
    filters: TransactionFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<TransactionRecord>> {
    return this.repository.findMany(filters, pagination)
  }

  async getById(id: string, userId: string): Promise<TransactionRecord | null> {
    return this.repository.findById(id, userId)
  }

  async create(input: CreateTransactionInput, currentBalance?: number): Promise<TransactionRecord> {
    const entity = TransactionEntity.create(input, currentBalance)

    const created = await this.repository.create({
      userId: entity.value.userId,
      description: entity.value.description,
      amount: entity.value.amount,
      type: entity.value.type,
      categoryId: entity.value.categoryId,
      date: entity.value.date,
      status: entity.value.status,
      notes: entity.value.notes,
      contactId: entity.value.contactId,
      areaId: entity.value.areaId,
      categoryGroupId: entity.value.categoryGroupId,
    })

    await this.recordEventSafely({
      userId: created.userId,
      eventType: "transaction_created",
      entityId: created.id,
      payload: {
        amount: created.amount,
        type: created.type,
        status: created.status,
      },
    })

    return created
  }

  async update(
    id: string,
    userId: string,
    input: UpdateTransactionInput,
    currentBalance?: number,
  ): Promise<TransactionRecord> {
    const existing = await this.repository.findById(id, userId)

    if (!existing) {
      throw new Error("Transacao nao encontrada para este usuario")
    }

    const entity = TransactionEntity.fromRecord(toEntityProps(existing))
    const data: UpdateTransactionRecordInput = entity.buildUpdatePayload(input, currentBalance)

    const updated = await this.repository.update(id, userId, data)

    if (!updated) {
      throw new Error("Transacao nao encontrada para este usuario")
    }

    await this.recordEventSafely({
      userId,
      eventType: "transaction_updated",
      entityId: updated.id,
      payload: data,
    })

    return updated
  }

  async remove(id: string, userId: string): Promise<TransactionRecord> {
    const deleted = await this.repository.delete(id, userId)

    if (!deleted) {
      throw new Error("Transacao nao encontrada para este usuario")
    }

    await this.recordEventSafely({
      userId,
      eventType: "transaction_deleted",
      entityId: deleted.id,
      payload: {
        deletedAt: deleted.deletedAt ?? new Date(),
      },
    })

    return deleted
  }
}
