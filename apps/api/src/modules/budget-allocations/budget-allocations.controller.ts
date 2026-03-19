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
import { BudgetApplicationService } from "../budget/application/budget.service"
import { mapBudgetAllocation } from "@/core/lib/server/http/budgets-mapper"

@Controller("budget-allocations")
@UseGuards(JwtAuthGuard)
export class BudgetAllocationsController {
  constructor(private readonly budgetService: BudgetApplicationService) {}

  @Get()
  async list(@AuthUser() userId: string, @Query("month") month?: string) {
    const result = await this.budgetService.listAllocations({ userId, month })
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

    const created = await this.budgetService.createAllocation({
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
    const updated = await this.budgetService.updateAllocation(id, userId, {
      plannedAmount: body.planned_amount ?? body.plannedAmount,
      fundedAmount: body.funded_amount ?? body.fundedAmount,
      spentAmount: body.spent_amount ?? body.spentAmount,
      availableAmount: body.available_amount ?? body.availableAmount,
    })
    return mapBudgetAllocation(updated)
  }

  @Delete(":id")
  async remove(@AuthUser() userId: string, @Param("id") id: string) {
    const deleted = await this.budgetService.deleteAllocation(id, userId)
    return mapBudgetAllocation(deleted)
  }

  @Post("transfer")
  @HttpCode(HttpStatus.OK)
  async transfer(
    @AuthUser() userId: string,
    @Body() body: { fromId?: string; toId?: string; amount?: number },
  ) {
    if (!body.fromId || !body.toId) {
      throw Object.assign(new Error("Campos obrigatorios: fromId, toId"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }

    const amount = Number(body.amount)
    if (!amount || amount <= 0) {
      throw Object.assign(new Error("Amount deve ser maior que zero"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }

    const result = await this.budgetService.transferFunds(
      body.fromId,
      body.toId,
      amount,
      userId,
    )

    return {
      from: mapBudgetAllocation(result.from),
      to: mapBudgetAllocation(result.to),
    }
  }
}
