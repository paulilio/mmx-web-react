import { NextRequest } from "next/server"
import { budgetService } from "../../../../lib/server/services"
import { fail, ok } from "../../../../lib/server/http/api-response"
import { mapBudgetAllocation, resolveUserId } from "../../../../lib/server/http/budgets-mapper"

export const runtime = "nodejs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as {
      userId?: string
      planned_amount?: number
      plannedAmount?: number
      funded_amount?: number
      fundedAmount?: number
      spent_amount?: number
      spentAmount?: number
      available_amount?: number
      availableAmount?: number
    }
    const userId = resolveUserId(request, body.userId)
    if (!userId) return fail(400, "USER_ID_REQUIRED", "Informe o userId no body, query ou header x-user-id")

    const updated = await budgetService.updateAllocation(params.id, userId, {
      plannedAmount: body.planned_amount ?? body.plannedAmount,
      fundedAmount: body.funded_amount ?? body.fundedAmount,
      spentAmount: body.spent_amount ?? body.spentAmount,
      availableAmount: body.available_amount ?? body.availableAmount,
    })

    return ok(mapBudgetAllocation(updated))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar alocacao"
    return fail(400, "BUDGET_ALLOCATION_UPDATE_ERROR", message)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = resolveUserId(request)
    if (!userId) return fail(400, "USER_ID_REQUIRED", "Informe o userId na query ou no header x-user-id")

    const deleted = await budgetService.deleteAllocation(params.id, userId)

    return ok(mapBudgetAllocation(deleted))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao deletar alocacao"
    return fail(400, "BUDGET_ALLOCATION_DELETE_ERROR", message)
  }
}
