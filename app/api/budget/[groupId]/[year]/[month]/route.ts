import { NextRequest } from "next/server"
import { budgetService } from "@/lib/server/services"
import { fail, ok } from "@/lib/server/http/api-response"
import { mapBudget, resolveUserId } from "@/lib/server/http/budgets-mapper"

export const runtime = "nodejs"

export async function PUT(request: NextRequest, { params }: { params: { groupId: string; year: string; month: string } }) {
  try {
    const body = (await request.json()) as {
      userId?: string
      planned?: number
      funded?: number
      rolloverEnabled?: boolean
      rolloverAmount?: number | null
    }
    const userId = resolveUserId(request, body.userId)
    if (!userId) return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")

    const monthNum = Number(params.month)
    const yearNum = Number(params.year)

    // try to find existing budget for this group/month/year
    const existing = await budgetService.list({ userId, categoryGroupId: params.groupId, month: monthNum, year: yearNum })

    const currentBudget = existing.data?.[0]

    if (currentBudget) {
      const id = currentBudget.id
      const updated = await budgetService.update(id, userId, {
        planned: body.planned,
        funded: body.funded,
        rolloverEnabled: body.rolloverEnabled,
        rolloverAmount: body.rolloverAmount,
      })

      return ok(mapBudget(updated))
    }

    // create
    const created = await budgetService.create({
      userId,
      categoryGroupId: params.groupId,
      month: monthNum,
      year: yearNum,
      planned: body.planned ?? 0,
      funded: body.funded ?? 0,
      rolloverEnabled: body.rolloverEnabled ?? false,
      rolloverAmount: body.rolloverAmount ?? null,
    })

    return ok(mapBudget(created), 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar/criar orçamento"
    return fail(400, "BUDGET_UPDATE_ERROR", message)
  }
}
