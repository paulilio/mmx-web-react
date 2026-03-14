import type { Prisma } from "@prisma/client"

type NumericLike = number | string | Prisma.Decimal

export interface BudgetRecord {
  id: string
  userId: string
  categoryGroupId: string
  month: number
  year: number
  planned: NumericLike
  funded: NumericLike
  spent: NumericLike
  rolloverEnabled: boolean
  rolloverAmount?: NumericLike | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateBudgetRecordInput {
  userId: string
  categoryGroupId: string
  month: number
  year: number
  planned: NumericLike
  funded: NumericLike
  rolloverEnabled?: boolean
  rolloverAmount?: NumericLike | null
}

export interface UpdateBudgetRecordInput {
  planned?: NumericLike
  funded?: NumericLike
  rolloverEnabled?: boolean
  rolloverAmount?: NumericLike | null
}

export interface BudgetFilters {
  userId: string
  categoryGroupId?: string
  month?: number
  year?: number
}

export interface BudgetAllocationRecord {
  id: string
  userId: string
  budgetGroupId: string
  categoryGroupId?: string | null
  month: string
  plannedAmount: NumericLike
  fundedAmount: NumericLike
  spentAmount: NumericLike
  availableAmount: NumericLike
  createdAt: Date
  updatedAt: Date
}

export interface CreateBudgetAllocationInput {
  userId: string
  budgetGroupId: string
  categoryGroupId?: string | null
  month: string
  plannedAmount: NumericLike
  fundedAmount: NumericLike
}

export interface UpdateBudgetAllocationInput {
  plannedAmount?: NumericLike
  fundedAmount?: NumericLike
  spentAmount?: NumericLike
  availableAmount?: NumericLike
}

export interface BudgetAllocationFilters {
  userId: string
  month?: string
  budgetGroupId?: string
}
