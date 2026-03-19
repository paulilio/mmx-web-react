import { Module } from "@nestjs/common"
import { AreasController } from "./areas.controller"
import { AREA_REPOSITORY } from "./application/ports/area-repository.port"
import { PrismaAreaRepository } from "./infrastructure/repositories/prisma-area.repository"
import { AreaApplicationService } from "./application/area.service"

@Module({
  controllers: [AreasController],
  providers: [
    { provide: AREA_REPOSITORY, useClass: PrismaAreaRepository },
    AreaApplicationService,
  ],
})
export class AreasModule {}
