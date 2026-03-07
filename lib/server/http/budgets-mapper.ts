import type { NextRequest } from "next/server"

export function resolveUserId(request: NextRequest, bodyUserId?: string): string | null {
  const queryUserId = request.nextUrl.searchParams.get("userId")
  const headerUserId = request.headers.get("x-user-id")
  return bodyUserId ?? queryUserId ?? headerUserId
}

export function mapBudget(record: any) {
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

export function mapBudgetAllocation(record: any) {
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
