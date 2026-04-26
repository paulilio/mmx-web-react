import { Injectable, Inject } from "@nestjs/common"
import {
  RECURRING_TEMPLATE_REPOSITORY,
  type IRecurringTemplateRepository,
} from "./ports/recurring-template-repository.port"
import type {
  RecurringTemplateRecord,
  RecurringSeriesCounts,
} from "../domain/recurring-template.types"
import type { TransactionRecord } from "../domain/transaction.types"

export interface RecurringSeriesView {
  template: RecurringTemplateRecord
  executions: TransactionRecord[]
  counts: RecurringSeriesCounts
}

@Injectable()
export class RecurringTemplateApplicationService {
  constructor(
    @Inject(RECURRING_TEMPLATE_REPOSITORY)
    private readonly repo: IRecurringTemplateRepository,
  ) {}

  async getSeries(templateId: string, userId: string): Promise<RecurringSeriesView | null> {
    const template = await this.repo.findById(templateId, userId)
    if (!template) return null

    const [executions, counts] = await Promise.all([
      this.repo.findExecutions(templateId, userId),
      this.repo.countExecutionsByStatus(templateId, userId),
    ])

    return { template, executions, counts }
  }
}
