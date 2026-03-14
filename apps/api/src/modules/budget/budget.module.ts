import { Module } from "@nestjs/common"
import { BudgetController } from "./budget.controller"
import { BudgetApplicationService } from "./application/budget.service"
import { BUDGET_REPOSITORY } from "./application/ports/budget-repository.port"
import { BUDGET_ALLOCATION_REPOSITORY } from "./application/ports/budget-allocation-repository.port"
import { PrismaBudgetRepository } from "./infrastructure/repositories/prisma-budget.repository"
import { PrismaBudgetAllocationRepository } from "./infrastructure/repositories/prisma-budget-allocation.repository"

@Module({
	controllers: [BudgetController],
	providers: [
		{ provide: BUDGET_REPOSITORY, useClass: PrismaBudgetRepository },
		{ provide: BUDGET_ALLOCATION_REPOSITORY, useClass: PrismaBudgetAllocationRepository },
		BudgetApplicationService,
	],
})
export class BudgetModule {}
