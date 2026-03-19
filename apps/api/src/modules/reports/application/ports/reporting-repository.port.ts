import type {
  CashflowStatusFilter,
  DashboardSummaryRecord,
  AgingReportRecord,
  CashflowItemRecord,
} from "../../domain/report.types"

export const REPORTING_REPOSITORY = Symbol("IReportingRepository")

export interface IReportingRepository {
  getSummary(userId: string): Promise<DashboardSummaryRecord>
  getAging(
    userId: string,
    filters?: { dateFrom?: string; dateTo?: string },
  ): Promise<AgingReportRecord>
  getCashflow(
    userId: string,
    filters?: { days?: number; status?: CashflowStatusFilter },
  ): Promise<CashflowItemRecord[]>
}
