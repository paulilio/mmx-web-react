import { describe, expect, it, vi } from "vitest"
import { AreaService } from "./area-service"
import type { AreaFilters, AreaRecord, AreaRepository } from "../repositories/area-repository"

function makeArea(overrides: Partial<AreaRecord> = {}): AreaRecord {
  return {
    id: "area-1",
    userId: "user-1",
    name: "Moradia",
    description: "Despesas fixas",
    type: "FIXED_EXPENSES",
    color: "#3b82f6",
    icon: "home",
    status: "ACTIVE",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  }
}

type RepositoryMock = Pick<AreaRepository, "findMany" | "findById" | "create" | "update" | "delete">

function createRepositoryMock(): RepositoryMock {
  return {
    findMany: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

describe("AreaService", () => {
  it("lista áreas delegando para o repositório", async () => {
    const repository = createRepositoryMock()
    const service = new AreaService(repository as AreaRepository)

    const filters: AreaFilters = { userId: "user-1" }
    const result = { data: [makeArea()], total: 1, page: 1, pageSize: 20 }
    vi.mocked(repository.findMany).mockResolvedValue(result)

    const response = await service.list(filters, { page: 1, pageSize: 20 })

    expect(response.total).toBe(1)
    expect(repository.findMany).toHaveBeenCalledWith(filters, { page: 1, pageSize: 20 })
  })

  it("cria área com normalização do domínio", async () => {
    const repository = createRepositoryMock()
    const service = new AreaService(repository as AreaRepository)

    vi.mocked(repository.create).mockResolvedValue(makeArea({ type: "DAILY_EXPENSES", status: "ACTIVE" }))

    await service.create({
      userId: "user-1",
      name: "Alimentação",
      type: "daily-expenses",
      color: "#f59e0b",
      icon: "shopping-cart",
      status: "active",
    })

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "DAILY_EXPENSES",
        status: "ACTIVE",
      }),
    )
  })

  it("falha update quando área não existe", async () => {
    const repository = createRepositoryMock()
    const service = new AreaService(repository as AreaRepository)

    vi.mocked(repository.findById).mockResolvedValue(null)

    await expect(service.update("area-404", "user-1", { name: "Nova área" })).rejects.toThrow(
      "Area nao encontrada para este usuario",
    )
  })

  it("atualiza área existente", async () => {
    const repository = createRepositoryMock()
    const service = new AreaService(repository as AreaRepository)

    vi.mocked(repository.findById).mockResolvedValue(makeArea())
    vi.mocked(repository.update).mockResolvedValue(makeArea({ name: "Moradia Prime", status: "INACTIVE" }))

    const response = await service.update("area-1", "user-1", {
      name: "Moradia Prime",
      status: "inactive",
    })

    expect(response.name).toBe("Moradia Prime")
    expect(repository.update).toHaveBeenCalledWith(
      "area-1",
      "user-1",
      expect.objectContaining({
        name: "Moradia Prime",
        status: "INACTIVE",
      }),
    )
  })

  it("falha remove quando área não existe", async () => {
    const repository = createRepositoryMock()
    const service = new AreaService(repository as AreaRepository)

    vi.mocked(repository.delete).mockResolvedValue(null)

    await expect(service.remove("area-404", "user-1")).rejects.toThrow("Area nao encontrada para este usuario")
  })
})
