import type { TransactionRecord } from "../../domain/transaction.types"
import type {
  RecurringTemplateRecord,
  CreateRecurringTemplateInput,
  UpdateRecurringTemplateInput,
  RecurringSeriesCounts,
} from "../../domain/recurring-template.types"
import type { CreateTransactionRecordInput } from "../../domain/transaction.types"

export const RECURRING_TEMPLATE_REPOSITORY = Symbol("IRecurringTemplateRepository")

export interface CreateRecurringSeriesData {
  template: CreateRecurringTemplateInput
  executions: CreateTransactionRecordInput[]
}

export interface IRecurringTemplateRepository {
  findById(id: string, userId: string): Promise<RecurringTemplateRecord | null>
  findExecutions(templateId: string, userId: string): Promise<TransactionRecord[]>
  countExecutionsByStatus(templateId: string, userId: string): Promise<RecurringSeriesCounts>
  createSeries(
    data: CreateRecurringSeriesData,
  ): Promise<{ template: RecurringTemplateRecord; executions: TransactionRecord[] }>
  update(
    id: string,
    userId: string,
    data: UpdateRecurringTemplateInput,
  ): Promise<RecurringTemplateRecord | null>
  delete(id: string, userId: string): Promise<RecurringTemplateRecord | null>

  /** Update applyMode=future|all. Retorna número de transactions afetadas. */
  updateExecutions(
    templateId: string,
    userId: string,
    options: {
      fromDate?: Date
      preserveExceptions?: boolean
    },
    patch: {
      description?: string
      amount?: number
      type?: import("../../domain/transaction-entity").DomainTransactionType
      categoryId?: string
      contactId?: string | null
      status?: import("../../domain/transaction-entity").DomainTransactionStatus
      notes?: string | null
      areaId?: string | null
      categoryGroupId?: string | null
    },
  ): Promise<number>

  /** Soft-delete por escopo. all hard-deleta o template. */
  deleteExecutions(
    templateId: string,
    userId: string,
    options: { fromDate?: Date; onlyId?: string },
  ): Promise<number>
}
