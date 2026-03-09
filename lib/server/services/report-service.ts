import type { DomainTransactionStatus, DomainTransactionType } from "@/lib/domain/transactions/transaction-entity"
import type { TransactionRepository } from "@/lib/server/repositories/transaction-repository"

interface SummaryTransaction {
  amount: number
  type: DomainTransactionType
  status: DomainTransactionStatus
}

export interface DashboardSummaryRecord {
  totalOpen: number
  totalOverdue: number
  totalNext7Days: number
  totalNext30Days: number
  totalReceivables: number
  totalPayables: number
  completedReceivables: number
  completedPayables: number
  pendingReceivables: number
  pendingPayables: number
}

export class ReportService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

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

  async getSummary(userId: string): Promise<DashboardSummaryRecord> {
    const transactions = await this.transactionRepository.findAllByUser(userId)

    const normalized = transactions.map(
      (item) =>
        ({
          amount: this.toAmount(item.amount),
          type: item.type,
          status: item.status,
        }) as SummaryTransaction,
    )

    const completed = normalized.filter((item) => item.status === "COMPLETED")
    const pending = normalized.filter((item) => item.status === "PENDING")

    return {
      totalOpen: 0,
      totalOverdue: 0,
      totalNext7Days: 0,
      totalNext30Days: 0,
      totalReceivables: normalized.filter((item) => item.type === "INCOME").reduce((acc, item) => acc + item.amount, 0),
      totalPayables: normalized.filter((item) => item.type === "EXPENSE").reduce((acc, item) => acc + item.amount, 0),
      completedReceivables: completed
        .filter((item) => item.type === "INCOME")
        .reduce((acc, item) => acc + item.amount, 0),
      completedPayables: completed
        .filter((item) => item.type === "EXPENSE")
        .reduce((acc, item) => acc + item.amount, 0),
      pendingReceivables: pending.filter((item) => item.type === "INCOME").reduce((acc, item) => acc + item.amount, 0),
      pendingPayables: pending.filter((item) => item.type === "EXPENSE").reduce((acc, item) => acc + item.amount, 0),
    }
  }
}
