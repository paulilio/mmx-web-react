import { describe, expect, it, vi, beforeEach } from "vitest"
import { DuplicateTransactionUseCase } from "./duplicate-transaction.use-case"
import type { ITransactionRepository } from "../ports/transaction-repository.port"
import type { TransactionRecord } from "../../domain/transaction.types"

function makeRepo(): ITransactionRepository {
  return {
    findById: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    summarizeByTypeAndStatus: vi.fn(),
    summarizeAgingExpenses: vi.fn(),
    summarizeCashflowByDate: vi.fn(),
  }
}

function makeTx(overrides: Partial<TransactionRecord> = {}): TransactionRecord {
  return {
    id: "tx_orig",
    userId: "user_1",
    description: "Mercado",
    amount: 250,
    type: "EXPENSE",
    categoryId: "cat_1",
    contactId: "contact_1",
    date: new Date("2026-04-15"),
    status: "COMPLETED",
    notes: "Promoção",
    areaId: "area_1",
    categoryGroupId: "cg_1",
    templateId: "tpl_1",
    seriesIndex: 5,
    skipped: false,
    isException: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe("DuplicateTransactionUseCase", () => {
  let repo: ITransactionRepository
  let useCase: DuplicateTransactionUseCase

  beforeEach(() => {
    repo = makeRepo()
    useCase = new DuplicateTransactionUseCase(repo)
  })

  it("clona campos da original mas SEM templateId/seriesIndex (vira tx avulsa)", async () => {
    vi.mocked(repo.findById).mockResolvedValue(makeTx())
    vi.mocked(repo.create).mockImplementation(async (data) => ({
      ...data,
      id: "tx_new",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TransactionRecord))

    const result = await useCase.execute("user_1", "tx_orig")

    expect(repo.create).toHaveBeenCalledTimes(1)
    const created = vi.mocked(repo.create).mock.calls[0]?.[0]
    expect(created?.description).toBe("Mercado")
    expect(created?.amount).toBe(250)
    expect(created?.type).toBe("EXPENSE")
    expect(created?.categoryId).toBe("cat_1")
    expect(created?.contactId).toBe("contact_1")
    expect(created?.areaId).toBe("area_1")
    expect(created?.categoryGroupId).toBe("cg_1")
    // status reseta pra PENDING (cópia é planejamento)
    expect(created?.status).toBe("PENDING")
    // NÃO copia campos de série
    expect("templateId" in (created ?? {})).toBe(false)
    expect("seriesIndex" in (created ?? {})).toBe(false)
    expect(result.id).toBe("tx_new")
  })

  it("usa data padrão = hoje quando overrides.date ausente", async () => {
    vi.mocked(repo.findById).mockResolvedValue(makeTx())
    vi.mocked(repo.create).mockImplementation(async (data) => ({ ...data, id: "x", createdAt: new Date(), updatedAt: new Date() } as TransactionRecord))

    const before = Date.now()
    await useCase.execute("user_1", "tx_orig")
    const after = Date.now()

    const created = vi.mocked(repo.create).mock.calls[0]?.[0]
    const ts = created?.date.getTime() ?? 0
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })

  it("respeita overrides.date quando fornecido", async () => {
    vi.mocked(repo.findById).mockResolvedValue(makeTx())
    vi.mocked(repo.create).mockImplementation(async (data) => ({ ...data, id: "x", createdAt: new Date(), updatedAt: new Date() } as TransactionRecord))

    await useCase.execute("user_1", "tx_orig", { date: "2026-12-01" })

    const created = vi.mocked(repo.create).mock.calls[0]?.[0]
    expect(created?.date.toISOString().split("T")[0]).toBe("2026-12-01")
  })

  it("rejeita 404 quando transação original não existe", async () => {
    vi.mocked(repo.findById).mockResolvedValue(null)

    await expect(useCase.execute("user_1", "tx_inexistente")).rejects.toThrow(
      "Transação não encontrada",
    )
    expect(repo.create).not.toHaveBeenCalled()
  })

  it("rejeita 400 quando overrides.date é inválida", async () => {
    vi.mocked(repo.findById).mockResolvedValue(makeTx())

    await expect(
      useCase.execute("user_1", "tx_orig", { date: "data-bobagem" }),
    ).rejects.toThrow("Data inválida")
    expect(repo.create).not.toHaveBeenCalled()
  })
})
