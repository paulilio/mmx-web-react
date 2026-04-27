import { Injectable, Inject } from "@nestjs/common"
import {
  TRANSACTION_REPOSITORY,
  type ITransactionRepository,
} from "../ports/transaction-repository.port"
import type { TransactionRecord } from "../../domain/transaction.types"

@Injectable()
export class DuplicateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly repo: ITransactionRepository,
  ) {}

  async execute(
    userId: string,
    transactionId: string,
    overrides?: { date?: string },
  ): Promise<TransactionRecord> {
    const existing = await this.repo.findById(transactionId, userId)
    if (!existing) {
      throw Object.assign(new Error("Transação não encontrada"), {
        status: 404,
        code: "TRANSACTION_NOT_FOUND",
      })
    }

    const targetDate = overrides?.date ? new Date(overrides.date) : new Date()
    if (Number.isNaN(targetDate.getTime())) {
      throw Object.assign(new Error("Data inválida"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }

    return this.repo.create({
      userId,
      description: existing.description,
      amount: Number(existing.amount),
      type: existing.type,
      categoryId: existing.categoryId,
      contactId: existing.contactId ?? null,
      date: targetDate,
      status: "PENDING",
      notes: existing.notes ?? null,
      areaId: existing.areaId ?? null,
      categoryGroupId: existing.categoryGroupId ?? null,
      accountId: existing.accountId,
      // Importante: NÃO copiar templateId/seriesIndex/recurrence/transferGroupId — duplicata é avulsa
    })
  }
}
