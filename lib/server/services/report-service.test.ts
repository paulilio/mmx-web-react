import { describe, expect, it, vi } from "vitest"
import { ReportService } from "./report-service"
import type { TransactionRecord, TransactionRepository } from "../repositories/transaction-repository"

function makeTransaction(overrides: Partial<TransactionRecord> = {}): TransactionRecord {
  return {
    id: "tx-1",
    userId: "user-1",
    description: "Lancamento",
    amount: 100,
    type: "INCOME",
    categoryId: "cat-1",
    contactId: null,
    date: new Date("2026-03-01T00:00:00.000Z"),
    status: "PENDING",
    notes: null,
    recurrence: null,
    areaId: null,
    categoryGroupId: null,
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
    updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    ...overrides,
  }
}

type RepositoryMock = Pick<TransactionRepository, "findAllByUser">

function createRepositoryMock(): RepositoryMock {
  return {
    findAllByUser: vi.fn(),
  }
}

describe("ReportService", () => {
  it("consolida totais por tipo e status", async () => {
    const repository = createRepositoryMock()
    const service = new ReportService(repository as TransactionRepository)

    vi.mocked(repository.findAllByUser).mockResolvedValue([
      makeTransaction({ id: "tx-1", type: "INCOME", status: "COMPLETED", amount: 500 }),
      makeTransaction({ id: "tx-2", type: "INCOME", status: "PENDING", amount: 200 }),
      makeTransaction({ id: "tx-3", type: "EXPENSE", status: "COMPLETED", amount: 120 }),
      makeTransaction({ id: "tx-4", type: "EXPENSE", status: "PENDING", amount: 80 }),
    ])

    const summary = await service.getSummary("user-1")

    expect(summary.totalReceivables).toBe(700)
    expect(summary.totalPayables).toBe(200)
    expect(summary.completedReceivables).toBe(500)
    expect(summary.pendingReceivables).toBe(200)
    expect(summary.completedPayables).toBe(120)
    expect(summary.pendingPayables).toBe(80)
    expect(repository.findAllByUser).toHaveBeenCalledWith("user-1")
  })

  it("retorna zeros quando nao ha transacoes", async () => {
    const repository = createRepositoryMock()
    const service = new ReportService(repository as TransactionRepository)

    vi.mocked(repository.findAllByUser).mockResolvedValue([])

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

    vi.mocked(repository.findAllByUser).mockResolvedValue([
      makeTransaction({ id: "tx-1", type: "EXPENSE", status: "PENDING", amount: 100, date: overdueDate }),
      makeTransaction({ id: "tx-2", type: "EXPENSE", status: "COMPLETED", amount: 70, date: next7Date }),
      makeTransaction({ id: "tx-3", type: "EXPENSE", status: "PENDING", amount: 90, date: next30Date }),
      makeTransaction({ id: "tx-4", type: "EXPENSE", status: "PENDING", amount: 120, date: futureDate }),
      makeTransaction({ id: "tx-5", type: "INCOME", status: "PENDING", amount: 1000, date: overdueDate }),
      makeTransaction({ id: "tx-6", type: "EXPENSE", status: "CANCELLED", amount: 999, date: overdueDate }),
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

    vi.mocked(repository.findAllByUser).mockResolvedValue([
      makeTransaction({ id: "tx-1", type: "EXPENSE", status: "PENDING", amount: 50, date: new Date("2026-03-01") }),
      makeTransaction({ id: "tx-2", type: "EXPENSE", status: "PENDING", amount: 80, date: new Date("2026-03-20") }),
    ])

    const aging = await service.getAging("user-1", {
      dateFrom: "2026-03-10",
      dateTo: "2026-03-31",
    })

    expect(aging.overdue + aging.next7Days + aging.next30Days + aging.future).toBe(80)
  })

  it("falha aging com intervalo de datas invalido", async () => {
    const repository = createRepositoryMock()
    const service = new ReportService(repository as TransactionRepository)

    vi.mocked(repository.findAllByUser).mockResolvedValue([])

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

    const day1 = new Date("2026-03-01T00:00:00.000Z")
    const day2 = new Date("2026-03-02T00:00:00.000Z")

    vi.mocked(repository.findAllByUser).mockResolvedValue([
      makeTransaction({ id: "tx-1", date: day1, type: "INCOME", status: "COMPLETED", amount: 200 }),
      makeTransaction({ id: "tx-2", date: day1, type: "EXPENSE", status: "PENDING", amount: 50 }),
      makeTransaction({ id: "tx-3", date: day2, type: "EXPENSE", status: "COMPLETED", amount: 40 }),
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

    vi.mocked(repository.findAllByUser).mockResolvedValue([
      makeTransaction({ id: "tx-1", type: "INCOME", status: "COMPLETED", amount: 100 }),
      makeTransaction({ id: "tx-2", type: "INCOME", status: "PENDING", amount: 80 }),
      makeTransaction({ id: "tx-3", type: "EXPENSE", status: "CANCELLED", amount: 40 }),
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
