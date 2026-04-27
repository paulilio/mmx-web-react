import { describe, expect, it, beforeEach } from "vitest"
import {
  AccountApplicationService,
  AccountNameTakenError,
  AccountNotFoundError,
} from "./account.service"
import type { IAccountRepository } from "./ports/account-repository.port"
import type {
  AccountFilters,
  AccountRecord,
  CreateAccountRecordInput,
  UpdateAccountRecordInput,
} from "../domain/account.types"
import type { PaginatedResult } from "@/common/types/pagination.types"

class InMemoryAccountRepository implements IAccountRepository {
  private items: AccountRecord[] = []
  private movement = new Map<string, number>()
  private idCounter = 0

  setMovement(accountId: string, value: number) {
    this.movement.set(accountId, value)
  }

  async findById(id: string, userId: string): Promise<AccountRecord | null> {
    return this.items.find((a) => a.id === id && a.userId === userId) ?? null
  }

  async findByUserAndName(userId: string, name: string): Promise<AccountRecord | null> {
    return this.items.find((a) => a.userId === userId && a.name === name.trim()) ?? null
  }

  async findMany(
    filters: AccountFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<AccountRecord>> {
    const page = pagination?.page ?? 1
    const pageSize = pagination?.pageSize ?? 20

    const filtered = this.items.filter((a) => {
      if (a.userId !== filters.userId) return false
      if (filters.type && a.type !== filters.type) return false
      if (filters.status && a.status !== filters.status) return false
      return true
    })

    return { data: filtered, total: filtered.length, page, pageSize }
  }

  async create(data: CreateAccountRecordInput): Promise<AccountRecord> {
    this.idCounter += 1
    const now = new Date()
    const created: AccountRecord = {
      id: `acc-${this.idCounter}`,
      userId: data.userId,
      name: data.name,
      institutionName: data.institutionName ?? null,
      type: data.type,
      status: data.status,
      currency: data.currency,
      openingBalance: data.openingBalance,
      openingBalanceDate: data.openingBalanceDate,
      color: data.color ?? null,
      icon: data.icon ?? null,
      isBusiness: data.isBusiness,
      creditLimit: data.creditLimit ?? null,
      closingDay: data.closingDay ?? null,
      dueDay: data.dueDay ?? null,
      bankConnectionId: data.bankConnectionId ?? null,
      externalId: data.externalId ?? null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    }
    this.items.push(created)
    return created
  }

  async update(
    id: string,
    userId: string,
    data: UpdateAccountRecordInput,
  ): Promise<AccountRecord | null> {
    const idx = this.items.findIndex((a) => a.id === id && a.userId === userId)
    if (idx < 0) return null

    const current = this.items[idx]
    const merged: AccountRecord = {
      ...current,
      ...Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined),
      ),
      updatedAt: new Date(),
    } as AccountRecord
    this.items[idx] = merged
    return merged
  }

  async archive(id: string, userId: string): Promise<AccountRecord | null> {
    return this.update(id, userId, { status: "ARCHIVED", archivedAt: new Date() })
  }

  async computeMovement(accountId: string): Promise<number> {
    return this.movement.get(accountId) ?? 0
  }
}

describe("AccountApplicationService", () => {
  let repo: InMemoryAccountRepository
  let service: AccountApplicationService

  beforeEach(() => {
    repo = new InMemoryAccountRepository()
    service = new AccountApplicationService(repo)
  })

  it("create cria conta CHECKING com defaults", async () => {
    const created = await service.create({
      userId: "user-1",
      name: "BB Corrente",
      type: "checking",
    })
    expect(created.type).toBe("CHECKING")
    expect(created.status).toBe("ACTIVE")
    expect(created.currency).toBe("BRL")
  })

  it("create rejeita nome duplicado para o mesmo usuario", async () => {
    await service.create({ userId: "user-1", name: "BB Corrente", type: "checking" })
    await expect(
      service.create({ userId: "user-1", name: "BB Corrente", type: "savings" }),
    ).rejects.toThrow(AccountNameTakenError)
  })

  it("create permite mesmo nome em usuarios diferentes", async () => {
    await service.create({ userId: "user-1", name: "BB Corrente", type: "checking" })
    await expect(
      service.create({ userId: "user-2", name: "BB Corrente", type: "checking" }),
    ).resolves.toBeTruthy()
  })

  it("create de CREDIT_CARD exige campos especificos", async () => {
    await expect(
      service.create({ userId: "user-1", name: "Nubank", type: "credit-card" }),
    ).rejects.toThrow(/limite/i)
  })

  it("getById retorna null quando outro usuario", async () => {
    const created = await service.create({ userId: "user-1", name: "BB", type: "checking" })
    expect(await service.getById(created.id, "user-2")).toBeNull()
  })

  it("update aplica payload e respeita unicidade de nome", async () => {
    const a = await service.create({ userId: "user-1", name: "Conta A", type: "checking" })
    const b = await service.create({ userId: "user-1", name: "Conta B", type: "savings" })

    await expect(
      service.update(a.id, "user-1", { name: "Conta B" }),
    ).rejects.toThrow(AccountNameTakenError)

    const renamed = await service.update(a.id, "user-1", { name: "Conta Z" })
    expect(renamed.name).toBe("Conta Z")
    expect(b.id).toBeDefined()
  })

  it("update lanca AccountNotFoundError quando id inexistente", async () => {
    await expect(service.update("missing", "user-1", { name: "x" })).rejects.toThrow(AccountNotFoundError)
  })

  it("archive seta status ARCHIVED e archivedAt", async () => {
    const created = await service.create({ userId: "user-1", name: "BB", type: "checking" })
    const archived = await service.archive(created.id, "user-1")
    expect(archived.status).toBe("ARCHIVED")
    expect(archived.archivedAt).toBeInstanceOf(Date)
  })

  it("archive lanca AccountNotFoundError quando id de outro usuario", async () => {
    const created = await service.create({ userId: "user-1", name: "BB", type: "checking" })
    await expect(service.archive(created.id, "user-2")).rejects.toThrow(AccountNotFoundError)
  })

  it("getBalance combina openingBalance e movement", async () => {
    const created = await service.create({
      userId: "user-1",
      name: "BB",
      type: "checking",
      openingBalance: 1000,
    })
    repo.setMovement(created.id, 250)

    const balance = await service.getBalance(created.id, "user-1")
    expect(balance.openingBalance).toBe(1000)
    expect(balance.movement).toBe(250)
    expect(balance.currentBalance).toBe(1250)
    expect(balance.currency).toBe("BRL")
  })

  it("getBalance retorna currentBalance = opening quando sem movimento (Fase 1)", async () => {
    const created = await service.create({
      userId: "user-1",
      name: "BB",
      type: "checking",
      openingBalance: 500,
    })
    const balance = await service.getBalance(created.id, "user-1")
    expect(balance.movement).toBe(0)
    expect(balance.currentBalance).toBe(500)
  })

  it("list aplica filtros por type e status", async () => {
    await service.create({ userId: "user-1", name: "BB", type: "checking" })
    await service.create({
      userId: "user-1",
      name: "Nubank",
      type: "credit-card",
      creditLimit: 3000,
      closingDay: 5,
      dueDay: 12,
    })

    const checking = await service.list({ userId: "user-1", type: "CHECKING" })
    expect(checking.total).toBe(1)
    expect(checking.data[0].type).toBe("CHECKING")

    const cc = await service.list({ userId: "user-1", type: "CREDIT_CARD" })
    expect(cc.total).toBe(1)
    expect(cc.data[0].type).toBe("CREDIT_CARD")
  })
})
