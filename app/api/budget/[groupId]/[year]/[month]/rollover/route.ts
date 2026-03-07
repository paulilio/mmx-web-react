import { NextRequest } from "next/server"
import { budgetService } from "@/lib/server/services"
import { fail, ok } from "@/lib/server/http/api-response"
import { resolveUserId, mapBudget } from "@/lib/server/http/budgets-mapper"

export const runtime = "nodejs"

export async function PUT(request: NextRequest, { params }: { params: { groupId: string; year: string; month: string } }) {
  try {
    const body = (await request.json()) as any
    const userId = resolveUserId(request, body.userId)
    if (!userId) return fail(400, "USER_ID_REQUIRED", "Informe o userId no body, query ou header x-user-id")

    const monthNum = Number(params.month)
    const yearNum = Number(params.year)

    const existing = await budgetService.list({ userId, categoryGroupId: params.groupId, month: monthNum, year: yearNum })

    if (!existing.data || existing.data.length === 0) return fail(404, "BUDGET_NOT_FOUND", "Orçamento não encontrado para este mês")

    const id = existing.data[0].id
    const updated = await budgetService.update(id, userId, { rolloverEnabled: body.enabled, rolloverAmount: body.amount })

    return ok(mapBudget(updated))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao configurar rollover"
    return fail(400, "BUDGET_ROLLOVER_ERROR", message)
  }
}
