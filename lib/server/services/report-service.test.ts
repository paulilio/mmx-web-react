import { describe, expect, it, vi } from "vitest"
import { ReportService } from "./report-service"
import type { TransactionRepository } from "../repositories/transaction-repository"

type RepositoryMock = Pick<
  TransactionRepository,
  "summarizeByTypeAndStatus" | "summarizeAgingExpenses" | "summarizeCashflowByDate"
>

function createRepositoryMock(): RepositoryMock {
  return {
    summarizeByTypeAndStatus: vi.fn(),
    summarizeAgingExpenses: vi.fn(),
    summarizeCashflowByDate: vi.fn(),
  }
}

describe("ReportService", () => {
  it("consolida totais por tipo e status", async () => {
    const repository = createRepositoryMock()
    const service = new ReportService(repository as TransactionRepository)

    vi.mocked(repository.summarizeByTypeAndStatus).mockResolvedValue([
      { type: "INCOME", status: "COMPLETED", totalAmount: 500 },
      { type: "INCOME", status: "PENDING", totalAmount: 200 },
      { type: "EXPENSE", status: "COMPLETED", totalAmount: 120 },
      { type: "EXPENSE", status: "PENDING", totalAmount: 80 },
    ])

    const summary = await service.getSummary("user-1")

    expect(summary.totalReceivables).toBe(700)
    expect(summary.totalPayables).toBe(200)
    expect(summary.completedReceivables).toBe(500)
    expect(summary.pendingReceivables).toBe(200)
    expect(summary.completedPayables).toBe(120)
    expect(summary.pendingPayables).toBe(80)
    expect(repository.summarizeByTypeAndStatus).toHaveBeenCalledWith("user-1")
  })

  it("retorna zeros quando nao ha transacoes", async () => {
    const repository = createRepositoryMock()
    const service = new ReportService(repository as TransactionRepository)

    vi.mocked(repository.summarizeByTypeAndStatus).mockResolvedValue([])

    const summary = await service.getSummary("user-1")

    expect(summary).toEqual({
      totalOpen: 0,
      totalOverdue: 0,
      totalNext7Days: 0,
      totalNext30Days: 0,
      totalReceivables: 0,
      totalPayables: 0,
      completedReceivables: 0,
      completedPayables: 0,
      pendingReceivables: 0,
      pendingPayables: 0,
    })
  })

  it("calcula aging por janelas de vencimento e status", async () => {
    const repository = createRepositoryMock()
    const service = new ReportService(repository as TransactionRepository)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const overdueDate = new Date(today)
    overdueDate.setDate(today.getDate() - 2)

    const next7Date = new Date(today)
    next7Date.setDate(today.getDate() + 3)

    const next30Date = new Date(today)
    next30Date.setDate(today.getDate() + 15)

    const futureDate = new Date(today)
    futureDate.setDate(today.getDate() + 45)

    vi.mocked(repository.summarizeAgingExpenses).mockResolvedValue([
      { date: overdueDate, status: "PENDING", totalAmount: 100 },
      { date: next7Date, status: "COMPLETED", totalAmount: 70 },
      { date: next30Date, status: "PENDING", totalAmount: 90 },
      { date: futureDate, status: "PENDING", totalAmount: 120 },
    ])

    const aging = await service.getAging("user-1")

    expect(aging.overdue).toBe(100)
    expect(aging.next7Days).toBe(70)
    expect(aging.next30Days).toBe(90)
    expect(aging.future).toBe(120)
    expect(aging.completedNext7Days).toBe(70)
    expect(aging.pendingOverdue).toBe(100)
    expect(aging.pendingNext30Days).toBe(90)
  })

  it("aplica filtros dateFrom/dateTo no aging", async () => {
    const repository = createRepositoryMock()
    const service = new ReportService(repository as TransactionRepository)

    vi.mocked(repository.summarizeAgingExpenses).mockResolvedValue([
      { date: new Date("2026-03-20"), status: "PENDING", totalAmount: 80 },
    ])

    const aging = await service.getAging("user-1", {
      dateFrom: "2026-03-10",
      dateTo: "2026-03-31",
    })

    expect(aging.overdue + aging.next7Days + aging.next30Days + aging.future).toBe(80)
    expect(repository.summarizeAgingExpenses).toHaveBeenCalledWith("user-1", {
      dateFrom: new Date("2026-03-10"),
      dateTo: new Date("2026-03-31"),
    })
  })

  it("falha aging com intervalo de datas invalido", async () => {
    const repository = createRepositoryMock()
    const service = new ReportService(repository as TransactionRepository)

    vi.mocked(repository.summarizeAgingExpenses).mockResolvedValue([])

    await expect(
      service.getAging("user-1", {
        dateFrom: "2026-03-31",
        dateTo: "2026-03-01",
      }),
    ).rejects.toThrow("Intervalo de datas invalido")
  })

  it("gera cashflow agrupado por dia com saldos acumulados", async () => {
    const repository = createRepositoryMock()
    const service = new ReportService(repository as TransactionRepository)

    vi.mocked(repository.summarizeCashflowByDate).mockResolvedValue([
      { date: new Date("2026-03-01T00:00:00.000Z"), type: "INCOME", status: "COMPLETED", totalAmount: 200 },
      { date: new Date("2026-03-01T00:00:00.000Z"), type: "EXPENSE", status: "PENDING", totalAmount: 50 },
      { date: new Date("2026-03-02T00:00:00.000Z"), type: "EXPENSE", status: "COMPLETED", totalAmount: 40 },
    ])

    const cashflow = await service.getCashflow("user-1", {
      days: 5000,
      status: "all",
    })

    expect(cashflow).toEqual([
      {
        date: "2026-03-01",
        income: 200,
        expense: 50,
        balance: 150,
        completedIncome: 200,
        completedExpense: 0,
        completedBalance: 200,
        pendingIncome: 0,
        pendingExpense: 50,
        pendingBalance: -50,
      },
      {
        date: "2026-03-02",
        income: 0,
        expense: 40,
        balance: 110,
        completedIncome: 0,
        completedExpense: 40,
        completedBalance: 160,
        pendingIncome: 0,
        pendingExpense: 0,
        pendingBalance: -50,
      },
    ])
  })

  it("aplica filtro de status no cashflow", async () => {
    const repository = createRepositoryMock()
    const service = new ReportService(repository as TransactionRepository)

    vi.mocked(repository.summarizeCashflowByDate).mockResolvedValue([
      { date: new Date("2026-03-01T00:00:00.000Z"), type: "INCOME", status: "PENDING", totalAmount: 80 },
    ])

    const pendingOnly = await service.getCashflow("user-1", {
      days: 5000,
      status: "pending",
    })

    expect(pendingOnly).toHaveLength(1)
    const firstItem = pendingOnly[0]
    expect(firstItem).toBeDefined()
    expect(firstItem?.income).toBe(80)
    expect(firstItem?.expense).toBe(0)
  })
})
