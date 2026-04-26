import { Injectable, Inject } from "@nestjs/common"
import {
  RECURRING_TEMPLATE_REPOSITORY,
  type IRecurringTemplateRepository,
} from "../ports/recurring-template-repository.port"
import {
  generateRecurrenceDates,
  type RecurrenceRule,
} from "../../domain/generate-recurrence-dates"
import type {
  CreateRecurringTemplateInput,
  RecurringTemplateRecord,
} from "../../domain/recurring-template.types"
import type {
  CreateTransactionRecordInput,
  TransactionRecord,
} from "../../domain/transaction.types"
import type {
  DomainTransactionStatus,
  DomainTransactionType,
} from "../../domain/transaction-entity"

export interface CreateRecurringSeriesInput {
  userId: string
  template: CreateRecurringTemplateInput
  base: {
    description: string
    amount: number
    type: DomainTransactionType
    categoryId: string
    contactId?: string | null
    status: DomainTransactionStatus
    notes?: string | null
    areaId?: string | null
    categoryGroupId?: string | null
  }
}

@Injectable()
export class CreateRecurringSeriesUseCase {
  constructor(
    @Inject(RECURRING_TEMPLATE_REPOSITORY)
    private readonly repo: IRecurringTemplateRepository,
  ) {}

  async execute(
    input: CreateRecurringSeriesInput,
  ): Promise<{ template: RecurringTemplateRecord; executions: TransactionRecord[] }> {
    if (input.userId !== input.template.userId) {
      throw Object.assign(new Error("User não autorizado a criar série"), {
        status: 403,
        code: "FORBIDDEN",
      })
    }

    const rule: RecurrenceRule = {
      frequency: input.template.frequency,
      interval: input.template.interval,
      daysOfWeek: input.template.daysOfWeek ?? [],
      dayOfMonth: input.template.dayOfMonth ?? null,
      weekOfMonth: input.template.weekOfMonth ?? null,
      monthOfYear: input.template.monthOfYear ?? null,
      monthlyMode: input.template.monthlyMode ?? null,
      count: input.template.count ?? null,
      endDate: input.template.endDate ?? null,
    }

    const dates = generateRecurrenceDates({
      startDate: input.template.startDate,
      rule,
    })

    if (dates.length === 0) {
      throw Object.assign(new Error("Nenhuma ocorrência gerada para a regra fornecida"), {
        status: 400,
        code: "EMPTY_RECURRENCE",
      })
    }

    const executions: CreateTransactionRecordInput[] = dates.map((date) => ({
      userId: input.userId,
      description: input.base.description,
      amount: input.base.amount,
      type: input.base.type,
      categoryId: input.base.categoryId,
      contactId: input.base.contactId ?? null,
      date,
      status: input.base.status,
      notes: input.base.notes ?? null,
      areaId: input.base.areaId ?? null,
      categoryGroupId: input.base.categoryGroupId ?? null,
    }))

    return this.repo.createSeries({
      template: input.template,
      executions,
    })
  }
}
