import { Module } from "@nestjs/common"
import { HealthController } from "./health.controller"

// PrismaModule is @Global() — no explicit import needed
@Module({ controllers: [HealthController] })
export class HealthModule {}
