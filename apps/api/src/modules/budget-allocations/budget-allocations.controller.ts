import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { AuthUser } from "../../common/decorators/auth-user.decorator"
import { budgetService } from "@mmx/lib/server/services"
import { mapBudgetAllocation } from "@mmx/lib/server/http/budgets-mapper"

@Controller("budget-allocations")
@UseGuards(JwtAuthGuard)
export class BudgetAllocationsController {
  @Get()
  async list(@AuthUser() userId: string, @Query("month") month?: string) {
    const result = await budgetService.listAllocations({ userId, month })
    return { ...result, data: result.data.map(mapBudgetAllocation) }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AuthUser() userId: string,
    @Body() body: {
      budgetGroupId?: string
      categoryGroupId?: string | null
      month?: string
      planned_amount?: number
      plannedAmount?: number
      funded_amount?: number
      fundedAmount?: number
    },
  ) {
    if (!body.budgetGroupId || !body.month) {
      throw Object.assign(new Error("Campos obrigatorios: budgetGroupId, month, fundedAmount/plannedAmount"), { status: 400, code: "INVALID_INPUT" })
    }

    const created = await budgetService.createAllocation({
      userId,
      budgetGroupId: body.budgetGroupId,
      categoryGroupId: body.categoryGroupId ?? null,
      month: body.month,
      plannedAmount: body.planned_amount ?? body.plannedAmount ?? 0,
      fundedAmount: body.funded_amount ?? body.fundedAmount ?? 0,
    })

    return mapBudgetAllocation(created)
  }

  @Put(":id")
  async update(
    @AuthUser() userId: string,
    @Param("id") id: string,
    @Body() body: {
      planned_amount?: number
      plannedAmount?: number
      funded_amount?: number
      fundedAmount?: number
      spent_amount?: number
      spentAmount?: number
      available_amount?: number
      availableAmount?: number
    },
  ) {
    const updated = await budgetService.updateAllocation(id, userId, {
      plannedAmount: body.planned_amount ?? body.plannedAmount,
      fundedAmount: body.funded_amount ?? body.fundedAmount,
      spentAmount: body.spent_amount ?? body.spentAmount,
      availableAmount: body.available_amount ?? body.availableAmount,
    })
    return mapBudgetAllocation(updated)
  }

  @Delete(":id")
  async remove(@AuthUser() userId: string, @Param("id") id: string) {
    const deleted = await budgetService.deleteAllocation(id, userId)
    return mapBudgetAllocation(deleted)
  }
}
