import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/server/http/api-response"
import { resolveUserId } from "@/lib/server/http/transactions-mapper"
import { reportService } from "@/lib/server/services"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const daysParam = Number(request.nextUrl.searchParams.get("days") ?? 30)
    const statusParam = (request.nextUrl.searchParams.get("status") ?? "all").toLowerCase()

    if (!["all", "completed", "pending", "cancelled"].includes(statusParam)) {
      return fail(400, "INVALID_INPUT", "Status invalido para cashflow")
    }

    const cashflow = await reportService.getCashflow(userId, {
      days: Number.isFinite(daysParam) ? daysParam : 30,
      status: statusParam as "all" | "completed" | "pending" | "cancelled",
    })

    return ok(cashflow)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gerar cashflow"
    return fail(400, "REPORT_CASHFLOW_ERROR", message)
  }
}
