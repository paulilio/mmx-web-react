import { Module } from "@nestjs/common"
import { SettingsController } from "./settings.controller"
import { SettingsMaintenanceApplicationService } from "./application/settings-maintenance.service"
import { SETTINGS_MAINTENANCE_REPOSITORY } from "./application/ports/settings-maintenance-repository.port"
import { PrismaSettingsMaintenanceRepository } from "./infrastructure/repositories/prisma-settings-maintenance.repository"

@Module({
	controllers: [SettingsController],
	providers: [
		{
			provide: SETTINGS_MAINTENANCE_REPOSITORY,
			useClass: PrismaSettingsMaintenanceRepository,
		},
		SettingsMaintenanceApplicationService,
	],
})
export class SettingsModule {}
