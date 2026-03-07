import { NextRequest } from "next/server"
import { budgetService } from "../../../lib/server/services"
import { fail, ok } from "../../../lib/server/http/api-response"
import { mapBudgetAllocation, resolveUserId } from "../../../lib/server/http/budgets-mapper"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const userId = resolveUserId(request)
    if (!userId) return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")

    const month = request.nextUrl.searchParams.get("month") ?? undefined

    const result = await budgetService.listAllocations({ userId, month })

    return ok({ ...result, data: result.data.map(mapBudgetAllocation) })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao listar alocacoes"
    return fail(400, "BUDGET_ALLOCATION_LIST_ERROR", message)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: string
      budgetGroupId?: string
      categoryGroupId?: string | null
      month?: string
      planned_amount?: number
      plannedAmount?: number
      funded_amount?: number
      fundedAmount?: number
    }
    const userId = resolveUserId(request, body.userId)
    if (!userId) return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")

    if (!body.budgetGroupId || !body.month) return fail(400, "INVALID_INPUT", "Campos obrigatorios: budgetGroupId, month, fundedAmount/plannedAmount")

    const created = await budgetService.createAllocation({
      userId,
      budgetGroupId: body.budgetGroupId,
      categoryGroupId: body.categoryGroupId ?? null,
      month: body.month,
      plannedAmount: body.planned_amount ?? body.plannedAmount ?? 0,
      fundedAmount: body.funded_amount ?? body.fundedAmount ?? 0,
    })

    return ok(mapBudgetAllocation(created), 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar alocacao"
    return fail(400, "BUDGET_ALLOCATION_CREATE_ERROR", message)
  }
}
