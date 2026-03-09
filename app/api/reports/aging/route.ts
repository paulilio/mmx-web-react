import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/server/http/api-response"
import { resolveUserId } from "@/lib/server/http/transactions-mapper"
import { transactionRepository } from "@/lib/server/repositories"
import { ReportService } from "@/lib/server/services/report-service"

export const runtime = "nodejs"

const reportService = new ReportService(transactionRepository)

export async function GET(request: NextRequest) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const dateFrom = request.nextUrl.searchParams.get("dateFrom") ?? undefined
    const dateTo = request.nextUrl.searchParams.get("dateTo") ?? undefined

    const aging = await reportService.getAging(userId, { dateFrom, dateTo })
    return ok(aging)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gerar aging"
    return fail(400, "REPORT_AGING_ERROR", message)
  }
}
