import { Module } from "@nestjs/common"
import { OpenFinanceController } from "./open-finance.controller"

@Module({
  controllers: [OpenFinanceController],
})
export class OpenFinanceModule {}
