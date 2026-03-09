import { describe, expect, it, vi } from "vitest"
import { CategoryGroupService } from "./category-group-service"
import type {
  CategoryGroupFilters,
  CategoryGroupRecord,
  CategoryGroupRepository,
} from "../repositories/category-group-repository"

function makeCategoryGroup(overrides: Partial<CategoryGroupRecord> = {}): CategoryGroupRecord {
  return {
    id: "cg-1",
    userId: "user-1",
    name: "Fixas",
    description: "Despesas fixas",
    color: "#3b82f6",
    icon: "home",
    status: "ACTIVE",
    areaId: "area-1",
    categoryIds: ["cat-1"],
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  }
}

type RepositoryMock = Pick<CategoryGroupRepository, "findMany" | "findById" | "create" | "update" | "delete">

function createRepositoryMock(): RepositoryMock {
  return {
    findMany: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

describe("CategoryGroupService", () => {
  it("lista grupos delegando para o repositorio", async () => {
    const repository = createRepositoryMock()
    const service = new CategoryGroupService(repository as CategoryGroupRepository)

    const filters: CategoryGroupFilters = { userId: "user-1" }
    const result = { data: [makeCategoryGroup()], total: 1, page: 1, pageSize: 20 }
    vi.mocked(repository.findMany).mockResolvedValue(result)

    const response = await service.list(filters, { page: 1, pageSize: 20 })

    expect(response.total).toBe(1)
    expect(repository.findMany).toHaveBeenCalledWith(filters, { page: 1, pageSize: 20 })
  })

  it("cria grupo com normalizacao de campos", async () => {
    const repository = createRepositoryMock()
    const service = new CategoryGroupService(repository as CategoryGroupRepository)

    vi.mocked(repository.create).mockResolvedValue(makeCategoryGroup({ name: "Fixas" }))

    await service.create({
      userId: "user-1",
      name: "  Fixas  ",
      description: "  Despesas fixas  ",
      color: "#3b82f6",
      icon: "home",
      status: "ACTIVE",
    })

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Fixas",
        description: "Despesas fixas",
      }),
    )
  })

  it("falha update quando grupo nao existe", async () => {
    const repository = createRepositoryMock()
    const service = new CategoryGroupService(repository as CategoryGroupRepository)

    vi.mocked(repository.findById).mockResolvedValue(null)

    await expect(service.update("cg-404", "user-1", { name: "Novo" })).rejects.toThrow(
      "Grupo de categoria nao encontrado para este usuario",
    )
  })

  it("atualiza grupo existente", async () => {
    const repository = createRepositoryMock()
    const service = new CategoryGroupService(repository as CategoryGroupRepository)

    vi.mocked(repository.findById).mockResolvedValue(makeCategoryGroup())
    vi.mocked(repository.update).mockResolvedValue(makeCategoryGroup({ name: "Fixas Prime", status: "INACTIVE" }))

    const response = await service.update("cg-1", "user-1", {
      name: "  Fixas Prime ",
      description: "  Nova descricao ",
      status: "INACTIVE",
    })

    expect(response.name).toBe("Fixas Prime")
    expect(repository.update).toHaveBeenCalledWith(
      "cg-1",
      "user-1",
      expect.objectContaining({
        name: "Fixas Prime",
        description: "Nova descricao",
        status: "INACTIVE",
      }),
    )
  })

  it("falha remove quando grupo nao existe", async () => {
    const repository = createRepositoryMock()
    const service = new CategoryGroupService(repository as CategoryGroupRepository)

    vi.mocked(repository.delete).mockResolvedValue(null)

    await expect(service.remove("cg-404", "user-1")).rejects.toThrow("Grupo de categoria nao encontrado para este usuario")
  })
})
