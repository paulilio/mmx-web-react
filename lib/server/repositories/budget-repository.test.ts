import { beforeEach, describe, expect, it, vi } from "vitest"

const { budgetDelegate } = vi.hoisted(() => {
  return {
    budgetDelegate: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  }
})

vi.mock("../db/prisma", () => ({
  prisma: {
    budget: budgetDelegate,
  },
}))

import { BudgetRepository } from "./budget-repository"

describe("BudgetRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("findById filtra por id e userId", async () => {
    budgetDelegate.findFirst.mockResolvedValueOnce({ id: "b-1", userId: "user-1" })

    const repository = new BudgetRepository()
    const result = await repository.findById("b-1", "user-1")

    expect(budgetDelegate.findFirst).toHaveBeenCalledWith({ where: { id: "b-1", userId: "user-1" } })
    expect(result).toEqual({ id: "b-1", userId: "user-1" })
  })

  it("findMany aplica filtros e paginação", async () => {
    budgetDelegate.findMany.mockResolvedValueOnce([{ id: "b-1" }])
    budgetDelegate.count.mockResolvedValueOnce(1)

    const repository = new BudgetRepository()
    const result = await repository.findMany({ userId: "user-1", month: 3, year: 2026 }, { page: 1, pageSize: 10 })

    expect(result.total).toBe(1)
    expect(budgetDelegate.findMany).toHaveBeenCalled()
  })
})
