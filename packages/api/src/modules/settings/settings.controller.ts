import { Controller, Post, Body, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { AuthUser } from "../../common/decorators/auth-user.decorator"
import { SettingsMaintenanceApplicationService } from "./application/settings-maintenance.service"

@Controller("settings")
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private readonly settingsMaintenanceService: SettingsMaintenanceApplicationService,
  ) {}

  @Post("export")
  async exportData(@AuthUser() userId: string, @Body() body: { tables?: unknown[] }) {
    return this.settingsMaintenanceService.exportData(userId, body.tables)
  }

  @Post("import")
  async importData(@AuthUser() userId: string, @Body() body: { data?: unknown }) {
    if (body.data == null) {
      throw Object.assign(new Error("Payload de importacao obrigatorio"), { status: 400, code: "INVALID_INPUT" })
    }

    return this.settingsMaintenanceService.importData(userId, body.data)
  }

  @Post("clear")
  async clearData(@AuthUser() userId: string, @Body() body: { tables?: unknown[] }) {
    return this.settingsMaintenanceService.clearData(userId, body.tables)
  }
}
