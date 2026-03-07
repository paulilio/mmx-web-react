import { describe, expect, it, vi } from "vitest"
import { CategoryService } from "./category-service"
import type {
  CategoryFilters,
  CategoryRecord,
  CategoryRepository,
} from "../repositories/category-repository"

function makeCategory(overrides: Partial<CategoryRecord> = {}): CategoryRecord {
  return {
    id: "cat-1",
    userId: "user-1",
    name: "Supermercado",
    description: "Compras mensais",
    type: "EXPENSE",
    categoryGroupId: "group-1",
    areaId: "area-1",
    status: "ACTIVE",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  }
}

type RepositoryMock = Pick<CategoryRepository, "findMany" | "findById" | "create" | "update" | "delete">

function createRepositoryMock(): RepositoryMock {
  return {
    findMany: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

describe("CategoryService", () => {
  it("lista categorias delegando para o repositorio", async () => {
    const repository = createRepositoryMock()
    const service = new CategoryService(repository as CategoryRepository)

    const filters: CategoryFilters = { userId: "user-1" }
    const result = {
      data: [makeCategory()],
      total: 1,
      page: 1,
      pageSize: 20,
    }

    vi.mocked(repository.findMany).mockResolvedValue(result)

    const response = await service.list(filters, { page: 1, pageSize: 20 })

    expect(response.total).toBe(1)
    expect(repository.findMany).toHaveBeenCalledWith(filters, { page: 1, pageSize: 20 })
  })

  it("cria categoria com normalizacao do dominio", async () => {
    const repository = createRepositoryMock()
    const service = new CategoryService(repository as CategoryRepository)

    const created = makeCategory({ type: "INCOME", status: "ACTIVE", name: "Salario" })
    vi.mocked(repository.create).mockResolvedValue(created)

    const response = await service.create({
      userId: "user-1",
      name: "Salario",
      type: "income",
      description: null,
      status: "active",
    })

    expect(response.type).toBe("INCOME")
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        name: "Salario",
        type: "INCOME",
        status: "ACTIVE",
      }),
    )
  })

  it("falha update quando categoria nao existe", async () => {
    const repository = createRepositoryMock()
    const service = new CategoryService(repository as CategoryRepository)

    vi.mocked(repository.findById).mockResolvedValue(null)

    await expect(service.update("cat-404", "user-1", { name: "Novo nome" })).rejects.toThrow(
      "Categoria nao encontrada para este usuario",
    )
  })

  it("atualiza categoria existente", async () => {
    const repository = createRepositoryMock()
    const service = new CategoryService(repository as CategoryRepository)

    const existing = makeCategory()
    const updated = makeCategory({ name: "Supermercado Principal", status: "INACTIVE" })

    vi.mocked(repository.findById).mockResolvedValue(existing)
    vi.mocked(repository.update).mockResolvedValue(updated)

    const response = await service.update("cat-1", "user-1", {
      name: "Supermercado Principal",
      status: "inactive",
    })

    expect(response.name).toBe("Supermercado Principal")
    expect(repository.update).toHaveBeenCalledWith(
      "cat-1",
      "user-1",
      expect.objectContaining({
        name: "Supermercado Principal",
        status: "INACTIVE",
      }),
    )
  })

  it("falha remove quando categoria nao existe", async () => {
    const repository = createRepositoryMock()
    const service = new CategoryService(repository as CategoryRepository)

    vi.mocked(repository.delete).mockResolvedValue(null)

    await expect(service.remove("cat-404", "user-1")).rejects.toThrow("Categoria nao encontrada para este usuario")
  })
})
