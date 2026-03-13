import { Module } from "@nestjs/common"
import { BudgetAllocationsController } from "./budget-allocations.controller"

@Module({ controllers: [BudgetAllocationsController] })
export class BudgetAllocationsModule {}
