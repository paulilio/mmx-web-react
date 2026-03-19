import { Module } from "@nestjs/common"
import { BudgetAllocationsController } from "./budget-allocations.controller"
import { BudgetApplicationService } from "../budget/application/budget.service"
import { BUDGET_REPOSITORY } from "../budget/application/ports/budget-repository.port"
import { BUDGET_ALLOCATION_REPOSITORY } from "../budget/application/ports/budget-allocation-repository.port"
import { PrismaBudgetRepository } from "../budget/infrastructure/repositories/prisma-budget.repository"
import { PrismaBudgetAllocationRepository } from "../budget/infrastructure/repositories/prisma-budget-allocation.repository"

@Module({
	controllers: [BudgetAllocationsController],
	providers: [
		{ provide: BUDGET_REPOSITORY, useClass: PrismaBudgetRepository },
		{ provide: BUDGET_ALLOCATION_REPOSITORY, useClass: PrismaBudgetAllocationRepository },
		BudgetApplicationService,
	],
})
export class BudgetAllocationsModule {}
