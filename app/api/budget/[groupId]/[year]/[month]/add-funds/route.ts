import { NextRequest } from "next/server"
import { budgetService } from "@/lib/server/services"
import { fail, ok } from "@/lib/server/http/api-response"
import { resolveUserId, mapBudgetAllocation } from "@/lib/server/http/budgets-mapper"

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: { groupId: string; year: string; month: string } }) {
  try {
    const body = (await request.json()) as any
    const userId = resolveUserId(request, body.userId)
    if (!userId) return fail(400, "USER_ID_REQUIRED", "Informe o userId no body, query ou header x-user-id")

    const amount = Number(body.amount)
    if (!amount || amount <= 0) return fail(400, "INVALID_INPUT", "Amount deve ser maior que zero")

    const monthString = `${params.year}-${params.month.toString().padStart(2, "0")}`

    // find allocation for this group and month
    const list = await budgetService.listAllocations({ userId, month: monthString, budgetGroupId: params.groupId })

    const alloc = list.data?.[0]

    if (alloc) {
      const updated = await budgetService.addFunds(alloc.id, amount, userId)
      return ok(mapBudgetAllocation(updated))
    }

    // create new allocation
    const created = await budgetService.createAllocation({
      userId,
      budgetGroupId: params.groupId,
      categoryGroupId: null,
      month: monthString,
      plannedAmount: 0,
      fundedAmount: amount,
    })

    return ok(mapBudgetAllocation(created), 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao adicionar fundos"
    return fail(400, "BUDGET_ADD_FUNDS_ERROR", message)
  }
}
