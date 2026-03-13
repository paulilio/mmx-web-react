import { beforeEach, describe, expect, it, vi } from "vitest"

const { transactionDelegate } = vi.hoisted(() => {
  return {
    transactionDelegate: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  }
})

vi.mock("../db/prisma", () => ({
  prisma: {
    transaction: transactionDelegate,
  },
}))

import { TransactionRepository } from "./transaction-repository"

describe("TransactionRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("findById filtra por userId e registros ativos", async () => {
    transactionDelegate.findFirst.mockResolvedValueOnce({ id: "tx-1", userId: "user-1" })

    const repository = new TransactionRepository()
    const result = await repository.findById("tx-1", "user-1")

    expect(transactionDelegate.findFirst).toHaveBeenCalledWith({
      where: {
        id: "tx-1",
        userId: "user-1",
        deletedAt: null,
      },
    })
    expect(result).toEqual({ id: "tx-1", userId: "user-1" })
  })

  it("findMany aplica filtro de ativos e paginação", async () => {
    transactionDelegate.findMany.mockResolvedValueOnce([{ id: "tx-1" }])
    transactionDelegate.count.mockResolvedValueOnce(1)

    const repository = new TransactionRepository()
    const result = await repository.findMany({ userId: "user-1", status: "PENDING" }, { page: 1, pageSize: 10 })

    expect(result.total).toBe(1)
    expect(transactionDelegate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1",
          status: "PENDING",
          deletedAt: null,
        }),
      }),
    )
  })

  it("delete aplica soft delete via update", async () => {
    transactionDelegate.findFirst.mockResolvedValueOnce({ id: "tx-1", userId: "user-1" })
    transactionDelegate.update.mockResolvedValueOnce({ id: "tx-1", deletedAt: new Date("2026-03-13T00:00:00.000Z") })

    const repository = new TransactionRepository()
    const result = await repository.delete("tx-1", "user-1")

    expect(transactionDelegate.update).toHaveBeenCalledWith({
      where: { id: "tx-1" },
      data: {
        deletedAt: expect.any(Date),
      },
    })
    expect(result).toEqual(expect.objectContaining({ id: "tx-1" }))
  })

  it("delete retorna null quando transacao nao existe", async () => {
    transactionDelegate.findFirst.mockResolvedValueOnce(null)

    const repository = new TransactionRepository()
    const result = await repository.delete("tx-inexistente", "user-1")

    expect(transactionDelegate.update).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
