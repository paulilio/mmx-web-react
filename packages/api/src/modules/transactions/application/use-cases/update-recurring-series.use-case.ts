import { Injectable, Inject } from "@nestjs/common"
import {
  RECURRING_TEMPLATE_REPOSITORY,
  type IRecurringTemplateRepository,
} from "../ports/recurring-template-repository.port"
import type { RecurringTemplateRecord } from "../../domain/recurring-template.types"
import type {
  DomainTransactionStatus,
  DomainTransactionType,
} from "../../domain/transaction-entity"

export interface UpdateRecurringSeriesInput {
  userId: string
  templateId: string
  applyMode: "future" | "all"
  fromDate?: Date
  patch: {
    description?: string
    amount?: number
    type?: DomainTransactionType
    categoryId?: string
    contactId?: string | null
    status?: DomainTransactionStatus
    notes?: string | null
    areaId?: string | null
    categoryGroupId?: string | null
  }
  preserveExceptions?: boolean
}

@Injectable()
export class UpdateRecurringSeriesUseCase {
  constructor(
    @Inject(RECURRING_TEMPLATE_REPOSITORY)
    private readonly repo: IRecurringTemplateRepository,
  ) {}

  async execute(
    input: UpdateRecurringSeriesInput,
  ): Promise<{ updated: number; template: RecurringTemplateRecord }> {
    const template = await this.repo.findById(input.templateId, input.userId)
    if (!template) {
      throw Object.assign(new Error("Série de recorrência não encontrada"), {
        status: 404,
        code: "RECURRING_TEMPLATE_NOT_FOUND",
      })
    }

    if (input.applyMode === "future" && !input.fromDate) {
      throw Object.assign(new Error("applyMode=future requer fromDate"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }

    const updated = await this.repo.updateExecutions(
      input.templateId,
      input.userId,
      {
        fromDate: input.applyMode === "future" ? input.fromDate : undefined,
        preserveExceptions: input.preserveExceptions !== false,
      },
      input.patch,
    )

    // Atualiza snapshot do template para refletir nova source-of-truth
    const templateUpdated = await this.repo.update(input.templateId, input.userId, {
      templateAmount: input.patch.amount,
      templateDescription: input.patch.description,
      templateNotes: input.patch.notes,
      templateType: input.patch.type,
      templateCategoryId: input.patch.categoryId,
      templateContactId: input.patch.contactId,
      templateAreaId: input.patch.areaId,
      templateCategoryGroupId: input.patch.categoryGroupId,
    })

    return { updated, template: templateUpdated ?? template }
  }
}
