import { Injectable, Inject } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import {
  TRANSACTION_REPOSITORY,
  type ITransactionRepository,
} from "../ports/transaction-repository.port"
import type { TransactionRecord } from "../../domain/transaction.types"
import type {
  DomainTransactionStatus,
  DomainTransactionType,
} from "../../domain/transaction-entity"

export interface MarkAsExceptionInput {
  userId: string
  transactionId: string
  patch: {
    description?: string
    amount?: number
    type?: DomainTransactionType
    categoryId?: string
    contactId?: string | null
    date?: string
    status?: DomainTransactionStatus
    notes?: string | null
    areaId?: string | null
    categoryGroupId?: string | null
  }
}

@Injectable()
export class MarkAsExceptionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly txRepo: ITransactionRepository,
  ) {}

  async execute(input: MarkAsExceptionInput): Promise<TransactionRecord> {
    const existing = await this.txRepo.findById(input.transactionId, input.userId)
    if (!existing) {
      throw Object.assign(new Error("Transação não encontrada"), {
        status: 404,
        code: "TRANSACTION_NOT_FOUND",
      })
    }

    if (!existing.templateId) {
      throw Object.assign(
        new Error("Transação não pertence a série; use PATCH /transactions/:id direto"),
        { status: 400, code: "NOT_A_RECURRENCE" },
      )
    }

    const data: Prisma.TransactionUpdateInput = { isException: true }
    if (input.patch.description !== undefined) data.description = input.patch.description
    if (input.patch.amount !== undefined) data.amount = new Prisma.Decimal(input.patch.amount)
    if (input.patch.type !== undefined) data.type = input.patch.type
    if (input.patch.categoryId !== undefined)
      (data as Prisma.TransactionUncheckedUpdateInput).categoryId = input.patch.categoryId
    if (input.patch.contactId !== undefined)
      data.contactId = input.patch.contactId
    if (input.patch.date !== undefined) data.date = new Date(input.patch.date)
    if (input.patch.status !== undefined) data.status = input.patch.status
    if (input.patch.notes !== undefined) data.notes = input.patch.notes
    if (input.patch.areaId !== undefined) data.areaId = input.patch.areaId
    if (input.patch.categoryGroupId !== undefined)
      data.categoryGroupId = input.patch.categoryGroupId

    return (await this.prisma.transaction.update({
      where: { id: input.transactionId },
      data,
    })) as unknown as TransactionRecord
  }
}
