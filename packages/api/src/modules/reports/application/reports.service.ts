import { Injectable, Inject } from "@nestjs/common"
import {
  REPORTING_REPOSITORY,
  type IReportingRepository,
} from "./ports/reporting-repository.port"
import type {
  CashflowStatusFilter,
  DashboardSummaryRecord,
  AgingReportRecord,
  CashflowItemRecord,
} from "../domain/report.types"

@Injectable()
export class ReportsApplicationService {
  constructor(
    @Inject(REPORTING_REPOSITORY)
    private readonly repository: IReportingRepository,
  ) {}

  async getSummary(userId: string): Promise<DashboardSummaryRecord> {
    return this.repository.getSummary(userId)
  }

  async getAging(
    userId: string,
    filters: { dateFrom?: string; dateTo?: string } = {},
  ): Promise<AgingReportRecord> {
    return this.repository.getAging(userId, filters)
  }

  async getCashflow(
    userId: string,
    filters: { days?: number; status?: CashflowStatusFilter } = {},
  ): Promise<CashflowItemRecord[]> {
    return this.repository.getCashflow(userId, filters)
  }
}
