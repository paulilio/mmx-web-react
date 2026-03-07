import { describe, expect, it, vi } from "vitest"
import { ContactService } from "./contact-service"
import type {
  ContactFilters,
  ContactRecord,
  ContactRepository,
} from "../repositories/contact-repository"

function makeContact(overrides: Partial<ContactRecord> = {}): ContactRecord {
  return {
    id: "contact-1",
    userId: "user-1",
    name: "Cliente Alpha",
    email: "alpha@mmx.dev",
    phone: "11999999999",
    identifier: "12345678901",
    type: "CUSTOMER",
    status: "ACTIVE",
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
    updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    ...overrides,
  }
}

type RepositoryMock = Pick<ContactRepository, "findMany" | "findById" | "create" | "update" | "delete">

function createRepositoryMock(): RepositoryMock {
  return {
    findMany: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

describe("ContactService", () => {
  it("lista contatos delegando para repositorio", async () => {
    const repository = createRepositoryMock()
    const service = new ContactService(repository as ContactRepository)

    const filters: ContactFilters = { userId: "user-1" }
    const result = { data: [makeContact()], total: 1, page: 1, pageSize: 20 }
    vi.mocked(repository.findMany).mockResolvedValue(result)

    const response = await service.list(filters, { page: 1, pageSize: 20 })

    expect(response.total).toBe(1)
    expect(repository.findMany).toHaveBeenCalledWith(filters, { page: 1, pageSize: 20 })
  })

  it("cria contato com normalizacao do dominio", async () => {
    const repository = createRepositoryMock()
    const service = new ContactService(repository as ContactRepository)

    const created = makeContact({ type: "SUPPLIER", status: "ACTIVE", name: "Fornecedor Beta" })
    vi.mocked(repository.create).mockResolvedValue(created)

    const response = await service.create({
      userId: "user-1",
      name: "Fornecedor Beta",
      type: "supplier",
      status: "active",
      identifier: "00100200300",
    })

    expect(response.type).toBe("SUPPLIER")
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        name: "Fornecedor Beta",
        type: "SUPPLIER",
        status: "ACTIVE",
      }),
    )
  })

  it("falha update quando contato nao existe", async () => {
    const repository = createRepositoryMock()
    const service = new ContactService(repository as ContactRepository)

    vi.mocked(repository.findById).mockResolvedValue(null)

    await expect(service.update("contact-404", "user-1", { name: "Novo nome" })).rejects.toThrow(
      "Contato nao encontrado para este usuario",
    )
  })

  it("atualiza contato existente", async () => {
    const repository = createRepositoryMock()
    const service = new ContactService(repository as ContactRepository)

    vi.mocked(repository.findById).mockResolvedValue(makeContact())
    vi.mocked(repository.update).mockResolvedValue(makeContact({ name: "Cliente Prime", status: "INACTIVE" }))

    const response = await service.update("contact-1", "user-1", {
      name: "Cliente Prime",
      status: "inactive",
    })

    expect(response.name).toBe("Cliente Prime")
    expect(repository.update).toHaveBeenCalledWith(
      "contact-1",
      "user-1",
      expect.objectContaining({
        name: "Cliente Prime",
        status: "INACTIVE",
      }),
    )
  })

  it("falha remove quando contato nao existe", async () => {
    const repository = createRepositoryMock()
    const service = new ContactService(repository as ContactRepository)

    vi.mocked(repository.delete).mockResolvedValue(null)

    await expect(service.remove("contact-404", "user-1")).rejects.toThrow("Contato nao encontrado para este usuario")
  })
})
