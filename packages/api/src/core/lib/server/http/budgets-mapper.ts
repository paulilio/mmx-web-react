interface BudgetLikeRecord {
  id: string
  userId: string
  categoryGroupId: string
  month: number
  year: number
  planned: unknown
  funded: unknown
  spent: unknown
  rolloverEnabled: boolean
  rolloverAmount?: unknown
  createdAt: Date
  updatedAt: Date
}

interface BudgetAllocationLikeRecord {
  id: string
  userId: string
  budgetGroupId: string
  categoryGroupId?: string | null
  month: string
  plannedAmount: unknown
  fundedAmount: unknown
  spentAmount: unknown
  availableAmount: unknown
  createdAt?: Date
  updatedAt?: Date
}

export function mapBudget(record: BudgetLikeRecord) {
  return {
    id: record.id,
    userId: record.userId,
    categoryGroupId: record.categoryGroupId,
    month: record.month,
    year: record.year,
    planned: Number(record.planned),
    funded: Number(record.funded),
    spent: Number(record.spent),
    rolloverEnabled: Boolean(record.rolloverEnabled),
    rolloverAmount: record.rolloverAmount != null ? Number(record.rolloverAmount) : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

export function mapBudgetAllocation(record: BudgetAllocationLikeRecord) {
  return {
    id: record.id,
    userId: record.userId,
    budgetGroupId: record.budgetGroupId,
    categoryGroupId: record.categoryGroupId ?? undefined,
    month: record.month,
    planned_amount: Number(record.plannedAmount),
    funded_amount: Number(record.fundedAmount),
    spent_amount: Number(record.spentAmount),
    available_amount: Number(record.availableAmount),
    created_at: record.createdAt?.toISOString(),
    updated_at: record.updatedAt?.toISOString(),
  }
}
