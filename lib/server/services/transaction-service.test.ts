import { describe, expect, it, vi } from "vitest"
import { TransactionService } from "./transaction-service"

function createTransactionRepositoryMock() {
  return {
    findMany: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

function createLedgerEventServiceMock() {
  return {
    record: vi.fn(),
  }
}

describe("TransactionService", () => {
  it("registra evento transaction_created sem quebrar create", async () => {
    const repository = createTransactionRepositoryMock()
    const ledgerService = createLedgerEventServiceMock()
    const service = new TransactionService(repository as never, ledgerService as never)

    vi.mocked(repository.create).mockResolvedValueOnce({
      id: "tx-1",
      userId: "user-1",
      description: "Compra",
      amount: 100,
      type: "EXPENSE",
      categoryId: "cat-1",
      date: new Date("2026-03-13"),
      status: "PENDING",
      notes: null,
      contactId: null,
      areaId: null,
      categoryGroupId: null,
      recurrence: null,
      deletedAt: null,
      createdAt: new Date("2026-03-13"),
      updatedAt: new Date("2026-03-13"),
    })

    const created = await service.create({
      userId: "user-1",
      description: "Compra",
      amount: 100,
      type: "EXPENSE",
      categoryId: "cat-1",
      date: "2026-03-13",
      status: "PENDING",
    })

    expect(created.id).toBe("tx-1")
    expect(ledgerService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        eventType: "transaction_created",
        entityType: "transaction",
        entityId: "tx-1",
      }),
    )
  })

  it("nao quebra create quando log de evento falha", async () => {
    const repository = createTransactionRepositoryMock()
    const ledgerService = createLedgerEventServiceMock()
    const service = new TransactionService(repository as never, ledgerService as never)

    vi.mocked(repository.create).mockResolvedValueOnce({
      id: "tx-2",
      userId: "user-1",
      description: "Salario",
      amount: 2000,
      type: "INCOME",
      categoryId: "cat-2",
      date: new Date("2026-03-13"),
      status: "COMPLETED",
      notes: null,
      contactId: null,
      areaId: null,
      categoryGroupId: null,
      recurrence: null,
      deletedAt: null,
      createdAt: new Date("2026-03-13"),
      updatedAt: new Date("2026-03-13"),
    })
    vi.mocked(ledgerService.record).mockRejectedValueOnce(new Error("ledger down"))

    const created = await service.create({
      userId: "user-1",
      description: "Salario",
      amount: 2000,
      type: "INCOME",
      categoryId: "cat-2",
      date: "2026-03-13",
      status: "COMPLETED",
    })

    expect(created.id).toBe("tx-2")
  })

  it("registra evento transaction_deleted no remove", async () => {
    const repository = createTransactionRepositoryMock()
    const ledgerService = createLedgerEventServiceMock()
    const service = new TransactionService(repository as never, ledgerService as never)

    vi.mocked(repository.delete).mockResolvedValueOnce({
      id: "tx-3",
      userId: "user-1",
      description: "Conta",
      amount: 80,
      type: "EXPENSE",
      categoryId: "cat-3",
      date: new Date("2026-03-13"),
      status: "PENDING",
      notes: null,
      contactId: null,
      areaId: null,
      categoryGroupId: null,
      recurrence: null,
      deletedAt: new Date("2026-03-13"),
      createdAt: new Date("2026-03-13"),
      updatedAt: new Date("2026-03-13"),
    })

    const deleted = await service.remove("tx-3", "user-1")

    expect(deleted.id).toBe("tx-3")
    expect(ledgerService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "transaction_deleted",
        entityId: "tx-3",
      }),
    )
  })
})
