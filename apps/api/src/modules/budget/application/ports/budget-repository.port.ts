import type { PaginatedResult } from "@/common/types/pagination.types"
import type {
  BudgetRecord,
  CreateBudgetRecordInput,
  UpdateBudgetRecordInput,
  BudgetFilters,
} from "../../domain/budget.types"

export const BUDGET_REPOSITORY = Symbol("IBudgetRepository")

export interface IBudgetRepository {
  findById(id: string, userId: string): Promise<BudgetRecord | null>
  findMany(
    filters: BudgetFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<BudgetRecord>>
  create(data: CreateBudgetRecordInput): Promise<BudgetRecord>
  update(
    id: string,
    userId: string,
    data: UpdateBudgetRecordInput,
  ): Promise<BudgetRecord | null>
  delete(id: string, userId: string): Promise<BudgetRecord | null>
}
