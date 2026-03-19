import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { Prisma } from "@prisma/client"
import type {
  CashflowStatusFilter,
  DashboardSummaryRecord,
  AgingReportRecord,
  CashflowItemRecord,
} from "../../domain/report.types"
import type { IReportingRepository } from "../../application/ports/reporting-repository.port"

interface TransactionSummaryGroupRecord {
  type: "INCOME" | "EXPENSE"
  status: "COMPLETED" | "PENDING" | "CANCELLED"
  totalAmount: number
}

interface SummarySqlRow {
  type: "INCOME" | "EXPENSE"
  status: "COMPLETED" | "PENDING" | "CANCELLED"
  totalAmount: unknown
}

interface AgingSqlRow {
  date: Date
  status: "COMPLETED" | "PENDING" | "CANCELLED"
  totalAmount: unknown
}

interface CashflowSqlRow {
  date: Date
  type: "INCOME" | "EXPENSE"
  status: "COMPLETED" | "PENDING" | "CANCELLED"
  totalAmount: unknown
}

@Injectable()
export class PrismaReportingRepository implements IReportingRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toAmount(value: unknown): number {
    if (typeof value === "number") {
      return value
    }

    if (typeof value === "string") {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : 0
    }

    if (value && typeof value === "object" && "toString" in value) {
      const parsed = Number(String(value))
      return Number.isFinite(parsed) ? parsed : 0
    }

    return 0
  }

  private parseDateOrUndefined(value?: string): Date | undefined {
    if (!value) {
      return undefined
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Filtro de data invalido")
    }

    return parsed
  }

  private startOfToday(): Date {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }

  private toDateKey(value: Date): string {
    return value.toISOString().slice(0, 10)
  }

  async getSummary(userId: string): Promise<DashboardSummaryRecord> {
    const grouped = (await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT
          "type",
          "status",
          COALESCE(SUM("amount"), 0) AS "totalAmount"
        FROM "Transaction"
        WHERE "userId" = ${userId}
          AND "deletedAt" IS NULL
        GROUP BY "type", "status"
      `,
    )) as SummarySqlRow[]
    const sumBy = (predicate: (item: TransactionSummaryGroupRecord) => boolean) =>
      grouped
        .filter(predicate)
        .reduce((acc, item) => acc + this.toAmount(item.totalAmount), 0)

    return {
      totalOpen: 0,
      totalOverdue: 0,
      totalNext7Days: 0,
      totalNext30Days: 0,
      totalReceivables: sumBy((item) => item.type === "INCOME"),
      totalPayables: sumBy((item) => item.type === "EXPENSE"),
      completedReceivables: sumBy(
        (item) => item.type === "INCOME" && item.status === "COMPLETED",
      ),
      completedPayables: sumBy(
        (item) => item.type === "EXPENSE" && item.status === "COMPLETED",
      ),
      pendingReceivables: sumBy(
        (item) => item.type === "INCOME" && item.status === "PENDING",
      ),
      pendingPayables: sumBy(
        (item) => item.type === "EXPENSE" && item.status === "PENDING",
      ),
    }
  }

  async getAging(
    userId: string,
    filters: { dateFrom?: string; dateTo?: string } = {},
  ): Promise<AgingReportRecord> {
    const dateFrom = this.parseDateOrUndefined(filters.dateFrom)
    const dateTo = this.parseDateOrUndefined(filters.dateTo)

    if (dateFrom && dateTo && dateFrom.getTime() > dateTo.getTime()) {
      throw new Error("Intervalo de datas invalido")
    }

    const today = this.startOfToday()
    const next7 = new Date(today)
    next7.setDate(today.getDate() + 7)
    const next30 = new Date(today)
    next30.setDate(today.getDate() + 30)

    const dateFromClause = dateFrom
      ? Prisma.sql` AND "date" >= ${dateFrom}`
      : Prisma.empty
    const dateToClause = dateTo
      ? Prisma.sql` AND "date" <= ${dateTo}`
      : Prisma.empty

    const grouped = (await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT
          "date",
          "status",
          COALESCE(SUM("amount"), 0) AS "totalAmount"
        FROM "Transaction"
        WHERE "userId" = ${userId}
          AND "deletedAt" IS NULL
          AND "type" = 'EXPENSE'
          AND "status" <> 'CANCELLED'
          ${dateFromClause}
          ${dateToClause}
        GROUP BY "date", "status"
      `,
    )) as AgingSqlRow[]

    const report: AgingReportRecord = {
      overdue: 0,
      next7Days: 0,
      next30Days: 0,
      future: 0,
      completedOverdue: 0,
      completedNext7Days: 0,
      completedNext30Days: 0,
      pendingOverdue: 0,
      pendingNext7Days: 0,
      pendingNext30Days: 0,
    }

    for (const item of grouped) {
      const bucket =
        item.date < today
          ? "overdue"
          : item.date <= next7
            ? "next7Days"
            : item.date <= next30
              ? "next30Days"
              : "future"
      const amount = this.toAmount(item.totalAmount)

      if (bucket === "overdue") report.overdue += amount
      if (bucket === "next7Days") report.next7Days += amount
      if (bucket === "next30Days") report.next30Days += amount
      if (bucket === "future") report.future += amount

      if (item.status === "COMPLETED") {
        if (bucket === "overdue") report.completedOverdue += amount
        if (bucket === "next7Days") report.completedNext7Days += amount
        if (bucket === "next30Days") report.completedNext30Days += amount
      }

      if (item.status === "PENDING") {
        if (bucket === "overdue") report.pendingOverdue += amount
        if (bucket === "next7Days") report.pendingNext7Days += amount
        if (bucket === "next30Days") report.pendingNext30Days += amount
      }
    }

    return report
  }

  async getCashflow(
    userId: string,
    filters: { days?: number; status?: CashflowStatusFilter } = {},
  ): Promise<CashflowItemRecord[]> {
    const status = filters.status ?? "all"
    const days =
      Number.isFinite(filters.days) && (filters.days ?? 0) > 0
        ? Math.floor(filters.days as number)
        : 30
    const today = this.startOfToday()
    const fromDate = new Date(today)
    fromDate.setDate(today.getDate() - (days - 1))

    const statusClause =
      status === "all"
        ? Prisma.empty
        : status === "completed"
          ? Prisma.sql` AND "status" = 'COMPLETED'`
          : status === "pending"
            ? Prisma.sql` AND "status" = 'PENDING'`
            : Prisma.sql` AND "status" = 'CANCELLED'`

    const grouped = (await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT
          "date",
          "type",
          "status",
          COALESCE(SUM("amount"), 0) AS "totalAmount"
        FROM "Transaction"
        WHERE "userId" = ${userId}
          AND "deletedAt" IS NULL
          AND "date" >= ${fromDate}
          ${statusClause}
        GROUP BY "date", "type", "status"
      `,
    )) as CashflowSqlRow[]

    const byDate = new Map<
      string,
      {
        income: number
        expense: number
        completedIncome: number
        completedExpense: number
        pendingIncome: number
        pendingExpense: number
      }
    >()

    for (const item of grouped) {
      const key = this.toDateKey(item.date)
      if (!byDate.has(key)) {
        byDate.set(key, {
          income: 0,
          expense: 0,
          completedIncome: 0,
          completedExpense: 0,
          pendingIncome: 0,
          pendingExpense: 0,
        })
      }

      const bucket = byDate.get(key)
      if (!bucket) continue

      const amount = this.toAmount(item.totalAmount)
      const isIncome = item.type === "INCOME"
      const isCompleted = item.status === "COMPLETED"

      if (isIncome) {
        bucket.income += amount
        if (isCompleted) {
          bucket.completedIncome += amount
        } else {
          bucket.pendingIncome += amount
        }
      } else {
        bucket.expense += amount
        if (isCompleted) {
          bucket.completedExpense += amount
        } else {
          bucket.pendingExpense += amount
        }
      }
    }

    const sortedDates = Array.from(byDate.keys()).sort()
    let balance = 0
    let completedBalance = 0
    let pendingBalance = 0

    return sortedDates.map((date) => {
      const item = byDate.get(date)
      if (!item) {
        return {
          date,
          income: 0,
          expense: 0,
          balance,
          completedIncome: 0,
          completedExpense: 0,
          completedBalance,
          pendingIncome: 0,
          pendingExpense: 0,
          pendingBalance,
        }
      }

      balance += item.income - item.expense
      completedBalance += item.completedIncome - item.completedExpense
      pendingBalance += item.pendingIncome - item.pendingExpense

      return {
        date,
        income: item.income,
        expense: item.expense,
        balance,
        completedIncome: item.completedIncome,
        completedExpense: item.completedExpense,
        completedBalance,
        pendingIncome: item.pendingIncome,
        pendingExpense: item.pendingExpense,
        pendingBalance,
      }
    })
  }
}
