import { Module } from "@nestjs/common"
import { ReportsController } from "./reports.controller"
import { ReportsApplicationService } from "./application/reports.service"
import { REPORTING_REPOSITORY } from "./application/ports/reporting-repository.port"
import { PrismaReportingRepository } from "./infrastructure/repositories/prisma-reporting.repository"

@Module({
	controllers: [ReportsController],
	providers: [
		{ provide: REPORTING_REPOSITORY, useClass: PrismaReportingRepository },
		ReportsApplicationService,
	],
})
export class ReportsModule {}
