import { Injectable, Inject } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import {
  TRANSACTION_REPOSITORY,
  type ITransactionRepository,
} from "../ports/transaction-repository.port"
import type { TransactionRecord } from "../../domain/transaction.types"

@Injectable()
export class SkipNextOccurrenceUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly txRepo: ITransactionRepository,
  ) {}

  async execute(userId: string, transactionId: string): Promise<TransactionRecord> {
    const existing = await this.txRepo.findById(transactionId, userId)
    if (!existing) {
      throw Object.assign(new Error("Transação não encontrada"), {
        status: 404,
        code: "TRANSACTION_NOT_FOUND",
      })
    }

    if (!existing.templateId) {
      throw Object.assign(new Error("Transação não pertence a uma série de recorrência"), {
        status: 400,
        code: "NOT_A_RECURRENCE",
      })
    }

    const updated = (await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { skipped: true },
    })) as unknown as TransactionRecord & { recurrence: Prisma.JsonValue | null }

    return updated
  }
}
