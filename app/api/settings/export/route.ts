import { NextRequest } from "next/server"
import { fail, ok } from "@/lib/server/http/api-response"
import { resolveUserId } from "@/lib/server/http/transactions-mapper"
import { SettingsMaintenanceService } from "@/lib/server/services/settings-maintenance-service"

export const runtime = "nodejs"

const settingsMaintenanceService = new SettingsMaintenanceService()

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

    const data = await settingsMaintenanceService.exportData(userId, body.tables)
    return ok(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao exportar dados de configuracao"
    return fail(400, "SETTINGS_EXPORT_ERROR", message)
  }
}
