import type { PaginatedResult } from "@/common/types/pagination.types"
import type {
  BudgetAllocationRecord,
  CreateBudgetAllocationInput,
  UpdateBudgetAllocationInput,
  BudgetAllocationFilters,
} from "../../domain/budget.types"

export const BUDGET_ALLOCATION_REPOSITORY = Symbol("IBudgetAllocationRepository")

export interface IBudgetAllocationRepository {
  findById(id: string, userId: string): Promise<BudgetAllocationRecord | null>
  findMany(
    filters: BudgetAllocationFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<BudgetAllocationRecord>>
  create(data: CreateBudgetAllocationInput): Promise<BudgetAllocationRecord>
  update(
    id: string,
    userId: string,
    data: UpdateBudgetAllocationInput,
  ): Promise<BudgetAllocationRecord | null>
  delete(id: string, userId: string): Promise<BudgetAllocationRecord | null>
  transferFundsAtomic(
    fromId: string,
    toId: string,
    amount: number,
    userId: string,
  ): Promise<{
    from: BudgetAllocationRecord
    to: BudgetAllocationRecord
  }>
}
