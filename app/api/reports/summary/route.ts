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

    const summary = await reportService.getSummary(userId)
    return ok(summary)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gerar resumo"
    return fail(400, "REPORT_SUMMARY_ERROR", message)
  }
}
