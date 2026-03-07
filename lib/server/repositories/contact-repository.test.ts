import { beforeEach, describe, expect, it, vi } from "vitest"

const { contactDelegate } = vi.hoisted(() => {
  return {
    contactDelegate: {
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
    contact: contactDelegate,
  },
}))

import { ContactRepository } from "./contact-repository"

describe("ContactRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("findById filtra por id e userId", async () => {
    contactDelegate.findFirst.mockResolvedValueOnce({ id: "contact-1", userId: "user-1" })

    const repository = new ContactRepository()
    const result = await repository.findById("contact-1", "user-1")

    expect(contactDelegate.findFirst).toHaveBeenCalledWith({
      where: {
        id: "contact-1",
        userId: "user-1",
      },
    })
    expect(result).toEqual({ id: "contact-1", userId: "user-1" })
  })

  it("findMany aplica filtros e paginacao", async () => {
    const records = [
      {
        id: "contact-1",
        userId: "user-1",
        name: "Cliente A",
        email: null,
        phone: null,
        identifier: null,
        type: "CUSTOMER",
        status: "ACTIVE",
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
    ]

    contactDelegate.findMany.mockResolvedValueOnce(records)
    contactDelegate.count.mockResolvedValueOnce(1)

    const repository = new ContactRepository()
    const response = await repository.findMany(
      {
        userId: "user-1",
        type: "CUSTOMER",
        status: "ACTIVE",
        name: "Cliente",
      },
      { page: 2, pageSize: 10 },
    )

    expect(contactDelegate.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        type: "CUSTOMER",
        status: "ACTIVE",
        name: {
          contains: "Cliente",
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: 10,
      take: 10,
    })
    expect(response.total).toBe(1)
    expect(response.page).toBe(2)
    expect(response.pageSize).toBe(10)
  })

  it("create delega para prisma.contact.create", async () => {
    contactDelegate.create.mockResolvedValueOnce({ id: "contact-1" })

    const repository = new ContactRepository()
    const payload = {
      userId: "user-1",
      name: "Cliente A",
      email: "cliente@mmx.dev",
      phone: null,
      identifier: null,
      type: "CUSTOMER" as const,
      status: "ACTIVE" as const,
    }

    const result = await repository.create(payload)

    expect(contactDelegate.create).toHaveBeenCalledWith({ data: payload })
    expect(result).toEqual({ id: "contact-1" })
  })

  it("update retorna null quando contato nao existe", async () => {
    contactDelegate.findFirst.mockResolvedValueOnce(null)

    const repository = new ContactRepository()
    const result = await repository.update("contact-404", "user-1", { name: "Novo nome" })

    expect(contactDelegate.update).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it("update e delete delegam para prisma quando registro existe", async () => {
    contactDelegate.findFirst.mockResolvedValueOnce({ id: "contact-1", userId: "user-1" })
    contactDelegate.update.mockResolvedValueOnce({ id: "contact-1", name: "Atualizado" })

    const repository = new ContactRepository()
    const updated = await repository.update("contact-1", "user-1", { name: "Atualizado" })

    expect(contactDelegate.update).toHaveBeenCalledWith({
      where: { id: "contact-1" },
      data: { name: "Atualizado" },
    })
    expect(updated).toEqual({ id: "contact-1", name: "Atualizado" })

    contactDelegate.findFirst.mockResolvedValueOnce({ id: "contact-1", userId: "user-1" })
    contactDelegate.delete.mockResolvedValueOnce({ id: "contact-1" })

    const deleted = await repository.delete("contact-1", "user-1")

    expect(contactDelegate.delete).toHaveBeenCalledWith({
      where: { id: "contact-1" },
    })
    expect(deleted).toEqual({ id: "contact-1" })
  })
})
