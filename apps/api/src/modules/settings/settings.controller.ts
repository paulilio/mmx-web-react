import { Controller, Post, Body, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { AuthUser } from "../../common/decorators/auth-user.decorator"
import { settingsMaintenanceService } from "@mmx/lib/server/services"

@Controller("settings")
@UseGuards(JwtAuthGuard)
export class SettingsController {
  @Post("export")
  async exportData(@AuthUser() userId: string, @Body() body: { tables?: unknown[] }) {
    return settingsMaintenanceService.exportData(userId, body.tables)
  }

  @Post("import")
  async importData(@AuthUser() userId: string, @Body() body: { data?: unknown }) {
    if (body.data == null) {
      throw Object.assign(new Error("Payload de importacao obrigatorio"), { status: 400, code: "INVALID_INPUT" })
    }

    return settingsMaintenanceService.importData(userId, body.data)
  }

  @Post("clear")
  async clearData(@AuthUser() userId: string, @Body() body: { tables?: unknown[] }) {
    return settingsMaintenanceService.clearData(userId, body.tables)
  }
}
