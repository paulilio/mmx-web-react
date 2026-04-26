import { Injectable, Inject } from "@nestjs/common"
import {
  RECURRING_TEMPLATE_REPOSITORY,
  type IRecurringTemplateRepository,
} from "../ports/recurring-template-repository.port"
import {
  TRANSACTION_REPOSITORY,
  type ITransactionRepository,
} from "../ports/transaction-repository.port"

export type DeleteApplyMode = "single" | "future" | "all"

export interface DeleteRecurringSeriesInput {
  userId: string
  templateId: string
  applyMode: DeleteApplyMode
  fromTransactionId?: string
}

@Injectable()
export class DeleteRecurringSeriesUseCase {
  constructor(
    @Inject(RECURRING_TEMPLATE_REPOSITORY)
    private readonly recurringRepo: IRecurringTemplateRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly txRepo: ITransactionRepository,
  ) {}

  async execute(input: DeleteRecurringSeriesInput): Promise<{ deleted: number }> {
    const template = await this.recurringRepo.findById(input.templateId, input.userId)
    if (!template) {
      throw Object.assign(new Error("Série de recorrência não encontrada"), {
        status: 404,
        code: "RECURRING_TEMPLATE_NOT_FOUND",
      })
    }

    if (input.applyMode === "single") {
      if (!input.fromTransactionId) {
        throw Object.assign(new Error("applyMode=single requer fromTransactionId"), {
          status: 400,
          code: "INVALID_INPUT",
        })
      }
      const deleted = await this.recurringRepo.deleteExecutions(
        input.templateId,
        input.userId,
        { onlyId: input.fromTransactionId },
      )
      return { deleted }
    }

    if (input.applyMode === "future") {
      if (!input.fromTransactionId) {
        throw Object.assign(new Error("applyMode=future requer fromTransactionId"), {
          status: 400,
          code: "INVALID_INPUT",
        })
      }
      const reference = await this.txRepo.findById(input.fromTransactionId, input.userId)
      if (!reference) {
        throw Object.assign(new Error("Transação de referência não encontrada"), {
          status: 404,
          code: "TRANSACTION_NOT_FOUND",
        })
      }
      const deleted = await this.recurringRepo.deleteExecutions(
        input.templateId,
        input.userId,
        { fromDate: reference.date },
      )
      return { deleted }
    }

    // applyMode === "all"
    const deleted = await this.recurringRepo.deleteExecutions(
      input.templateId,
      input.userId,
      {},
    )
    await this.recurringRepo.delete(input.templateId, input.userId)
    return { deleted }
  }
}
