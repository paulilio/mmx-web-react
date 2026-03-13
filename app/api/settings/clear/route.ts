import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/server/http/api-response"
import { resolveUserId } from "@/lib/server/http/transactions-mapper"
import { settingsMaintenanceService } from "@/lib/server/services"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      userId?: string
      tables?: unknown[]
    }

    const userId = resolveUserId(request, body.userId)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const result = await settingsMaintenanceService.clearData(userId, body.tables)
    return ok(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao limpar dados de configuracao"
    return fail(400, "SETTINGS_CLEAR_ERROR", message)
  }
}
