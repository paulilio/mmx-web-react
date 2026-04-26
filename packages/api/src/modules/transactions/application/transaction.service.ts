import { Injectable, Inject } from "@nestjs/common"
import {
  TransactionEntity,
  type CreateTransactionEntityInput,
  type TransactionEntityProps,
  type UpdateTransactionEntityInput,
} from "../domain/transaction-entity"
import type { PaginatedResult } from "@/common/types/pagination.types"
import {
  TRANSACTION_REPOSITORY,
  type ITransactionRepository,
} from "./ports/transaction-repository.port"
import type {
  TransactionRecord,
  TransactionFilters,
  UpdateTransactionRecordInput,
} from "../domain/transaction.types"

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
    recurrence: record.recurrence,
  }
}

@Injectable()
export class TransactionApplicationService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly repo: ITransactionRepository,
  ) {}

  async list(
    filters: TransactionFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<TransactionRecord>> {
    return this.repo.findMany(filters, pagination)
  }

  async getById(id: string, userId: string): Promise<TransactionRecord | null> {
    return this.repo.findById(id, userId)
  }

  async create(
    input: CreateTransactionEntityInput,
    currentBalance?: number,
  ): Promise<TransactionRecord> {
    const entity = TransactionEntity.create(input, currentBalance)

    return this.repo.create({
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
      recurrence: entity.value.recurrence,
    })
  }

  async update(
    id: string,
    userId: string,
    input: UpdateTransactionEntityInput,
    currentBalance?: number,
  ): Promise<TransactionRecord> {
    const existing = await this.repo.findById(id, userId)

    if (!existing) {
      throw new Error("Transacao nao encontrada para este usuario")
    }

    const entity = TransactionEntity.fromRecord(toEntityProps(existing))
    const data: UpdateTransactionRecordInput = entity.buildUpdatePayload(
      input,
      currentBalance,
    )

    const updated = await this.repo.update(id, userId, data)

    if (!updated) {
      throw new Error("Transacao nao encontrada para este usuario")
    }

    return updated
  }

  async remove(id: string, userId: string): Promise<TransactionRecord> {
    const deleted = await this.repo.delete(id, userId)

    if (!deleted) {
      throw new Error("Transacao nao encontrada para este usuario")
    }

    return deleted
  }
}
