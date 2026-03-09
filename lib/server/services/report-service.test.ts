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
})
