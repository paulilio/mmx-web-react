import { beforeEach, describe, expect, it, vi } from "vitest"

const { categoryDelegate } = vi.hoisted(() => {
  return {
    categoryDelegate: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  }
})

vi.mock("@/lib/server/db/prisma", () => ({
  prisma: {
    category: categoryDelegate,
  },
}))

import { CategoryRepository } from "./category-repository"

describe("CategoryRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("findById filtra por id e userId", async () => {
    categoryDelegate.findFirst.mockResolvedValueOnce({ id: "cat-1", userId: "user-1" })

    const repository = new CategoryRepository()
    const result = await repository.findById("cat-1", "user-1")

    expect(categoryDelegate.findFirst).toHaveBeenCalledWith({
      where: {
        id: "cat-1",
        userId: "user-1",
      },
    })
    expect(result).toEqual({ id: "cat-1", userId: "user-1" })
  })

  it("findMany aplica filtros e paginacao", async () => {
    const records = [
      {
        id: "cat-1",
        userId: "user-1",
        name: "Mercado",
        description: null,
        type: "EXPENSE",
        categoryGroupId: null,
        areaId: null,
        status: "ACTIVE",
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
    ]

    categoryDelegate.findMany.mockResolvedValueOnce(records)
    categoryDelegate.count.mockResolvedValueOnce(1)

    const repository = new CategoryRepository()
    const response = await repository.findMany(
      {
        userId: "user-1",
        type: "EXPENSE",
        status: "ACTIVE",
      },
      { page: 2, pageSize: 10 },
    )

    expect(categoryDelegate.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        type: "EXPENSE",
        status: "ACTIVE",
        categoryGroupId: undefined,
        areaId: undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: 10,
      take: 10,
    })
    expect(categoryDelegate.count).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        type: "EXPENSE",
        status: "ACTIVE",
        categoryGroupId: undefined,
        areaId: undefined,
      },
    })
    expect(response.total).toBe(1)
    expect(response.page).toBe(2)
    expect(response.pageSize).toBe(10)
    expect(response.data).toEqual(records)
  })

  it("create delega para prisma.category.create", async () => {
    categoryDelegate.create.mockResolvedValueOnce({ id: "cat-1" })

    const repository = new CategoryRepository()
    const payload = {
      userId: "user-1",
      name: "Salario",
      description: null,
      type: "INCOME" as const,
      categoryGroupId: null,
      areaId: null,
      status: "ACTIVE" as const,
    }

    const result = await repository.create(payload)

    expect(categoryDelegate.create).toHaveBeenCalledWith({ data: payload })
    expect(result).toEqual({ id: "cat-1" })
  })

  it("update retorna null quando categoria nao existe", async () => {
    categoryDelegate.findFirst.mockResolvedValueOnce(null)

    const repository = new CategoryRepository()
    const result = await repository.update("cat-404", "user-1", { name: "Novo nome" })

    expect(categoryDelegate.update).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it("update e delete delegam para prisma quando registro existe", async () => {
    categoryDelegate.findFirst.mockResolvedValueOnce({ id: "cat-1", userId: "user-1" })
    categoryDelegate.update.mockResolvedValueOnce({ id: "cat-1", name: "Atualizado" })

    const repository = new CategoryRepository()
    const updated = await repository.update("cat-1", "user-1", { name: "Atualizado" })

    expect(categoryDelegate.update).toHaveBeenCalledWith({
      where: { id: "cat-1" },
      data: { name: "Atualizado" },
    })
    expect(updated).toEqual({ id: "cat-1", name: "Atualizado" })

    categoryDelegate.findFirst.mockResolvedValueOnce({ id: "cat-1", userId: "user-1" })
    categoryDelegate.delete.mockResolvedValueOnce({ id: "cat-1" })

    const deleted = await repository.delete("cat-1", "user-1")

    expect(categoryDelegate.delete).toHaveBeenCalledWith({
      where: { id: "cat-1" },
    })
    expect(deleted).toEqual({ id: "cat-1" })
  })
})
