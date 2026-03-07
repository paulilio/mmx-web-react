import { beforeEach, describe, expect, it, vi } from "vitest"

const { areaDelegate } = vi.hoisted(() => {
  return {
    areaDelegate: {
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
    area: areaDelegate,
  },
}))

import { AreaRepository } from "./area-repository"

describe("AreaRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("findById filtra por id e userId", async () => {
    areaDelegate.findFirst.mockResolvedValueOnce({ id: "area-1", userId: "user-1" })

    const repository = new AreaRepository()
    const result = await repository.findById("area-1", "user-1")

    expect(areaDelegate.findFirst).toHaveBeenCalledWith({
      where: {
        id: "area-1",
        userId: "user-1",
      },
    })
    expect(result).toEqual({ id: "area-1", userId: "user-1" })
  })

  it("findMany aplica filtros e paginação", async () => {
    areaDelegate.findMany.mockResolvedValueOnce([{ id: "area-1" }])
    areaDelegate.count.mockResolvedValueOnce(1)

    const repository = new AreaRepository()
    const result = await repository.findMany(
      {
        userId: "user-1",
        type: "INCOME",
        status: "ACTIVE",
      },
      { page: 2, pageSize: 10 },
    )

    expect(result.total).toBe(1)
    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(10)
  })
})
