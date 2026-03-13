import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/server/http/api-response"
import { resolveUserId } from "@/lib/server/http/transactions-mapper"
import { settingsMaintenanceService } from "@/lib/server/services"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: string
      data?: unknown
    }

    const userId = resolveUserId(request, body.userId)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    if (body.data == null) {
      return fail(400, "INVALID_INPUT", "Payload de importacao obrigatorio")
    }

    const result = await settingsMaintenanceService.importData(userId, body.data)
    return ok(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao importar dados de configuracao"
    return fail(400, "SETTINGS_IMPORT_ERROR", message)
  }
}
