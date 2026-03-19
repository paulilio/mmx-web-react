import {
  Controller,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { AuthUser } from "../../common/decorators/auth-user.decorator"
import { BudgetApplicationService } from "./application/budget.service"
import { mapBudget, mapBudgetAllocation } from "@/core/lib/server/http/budgets-mapper"

@Controller("budget")
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetApplicationService) {}

  @Put(":groupId/:year/:month")
  @HttpCode(HttpStatus.OK)
  async upsertBudget(
    @AuthUser() userId: string,
    @Param("groupId") groupId: string,
    @Param("year") year: string,
    @Param("month") month: string,
    @Body() body: {
      planned?: number
      funded?: number
      rolloverEnabled?: boolean
      rolloverAmount?: number | null
    },
  ) {
    const monthNum = Number(month)
    const yearNum = Number(year)

    const existing = await this.budgetService.list({ userId, categoryGroupId: groupId, month: monthNum, year: yearNum })
    const currentBudget = existing.data?.[0]

    if (currentBudget) {
      const updated = await this.budgetService.update(currentBudget.id, userId, {
        planned: body.planned,
        funded: body.funded,
        rolloverEnabled: body.rolloverEnabled,
        rolloverAmount: body.rolloverAmount,
      })
      return mapBudget(updated)
    }

    const created = await this.budgetService.create({
      userId,
      categoryGroupId: groupId,
      month: monthNum,
      year: yearNum,
      planned: body.planned ?? 0,
      funded: body.funded ?? 0,
      rolloverEnabled: body.rolloverEnabled ?? false,
      rolloverAmount: body.rolloverAmount ?? null,
    })
    return mapBudget(created)
  }

  @Post(":groupId/:year/:month/add-funds")
  @HttpCode(HttpStatus.OK)
  async addFunds(
    @AuthUser() userId: string,
    @Param("groupId") groupId: string,
    @Param("year") year: string,
    @Param("month") month: string,
    @Body() body: { amount?: number },
  ) {
    const amount = Number(body.amount)
    if (!amount || amount <= 0) {
      throw Object.assign(new Error("Amount deve ser maior que zero"), { status: 400, code: "INVALID_INPUT" })
    }

    const monthString = `${year}-${month.toString().padStart(2, "0")}`
    const list = await this.budgetService.listAllocations({ userId, month: monthString, budgetGroupId: groupId })
    const alloc = list.data?.[0]

    if (alloc) {
      const updated = await this.budgetService.addFunds(alloc.id, amount, userId)
      return mapBudgetAllocation(updated)
    }

    const created = await this.budgetService.createAllocation({
      userId,
      budgetGroupId: groupId,
      categoryGroupId: null,
      month: monthString,
      plannedAmount: 0,
      fundedAmount: amount,
    })
    return mapBudgetAllocation(created)
  }

  @Put(":groupId/:year/:month/rollover")
  @HttpCode(HttpStatus.OK)
  async configureRollover(
    @AuthUser() userId: string,
    @Param("groupId") groupId: string,
    @Param("year") year: string,
    @Param("month") month: string,
    @Body() body: { enabled?: boolean; amount?: number },
  ) {
    const monthNum = Number(month)
    const yearNum = Number(year)

    const existing = await this.budgetService.list({ userId, categoryGroupId: groupId, month: monthNum, year: yearNum })
    const currentBudget = existing.data?.[0]

    if (!currentBudget) {
      throw Object.assign(new Error("Orcamento nao encontrado para este mes"), { status: 404, code: "BUDGET_NOT_FOUND" })
    }

    const updated = await this.budgetService.update(currentBudget.id, userId, {
      rolloverEnabled: body.enabled,
      rolloverAmount: body.amount,
    })
    return mapBudget(updated)
  }
}
