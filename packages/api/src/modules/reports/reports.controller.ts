import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { AuthUser } from "../../common/decorators/auth-user.decorator"
import { ReportsApplicationService } from "./application/reports.service"

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsApplicationService) {}

  @Get("summary")
  async summary(@AuthUser() userId: string) {
    return this.reportsService.getSummary(userId)
  }

  @Get("aging")
  async aging(@AuthUser() userId: string, @Query("dateFrom") dateFrom?: string, @Query("dateTo") dateTo?: string) {
    return this.reportsService.getAging(userId, { dateFrom, dateTo })
  }

  @Get("cashflow")
  async cashflow(@AuthUser() userId: string, @Query("days") days?: string, @Query("status") status?: string) {
    const statusParam = (status ?? "all").toLowerCase()
    if (!["all", "completed", "pending", "cancelled"].includes(statusParam)) {
      throw Object.assign(new Error("Status invalido para cashflow"), { status: 400, code: "INVALID_INPUT" })
    }

    const daysParam = Number(days ?? 30)
    return this.reportsService.getCashflow(userId, {
      days: Number.isFinite(daysParam) ? daysParam : 30,
      status: statusParam as "all" | "completed" | "pending" | "cancelled",
    })
  }
}
