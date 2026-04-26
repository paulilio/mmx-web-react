import { describe, expect, it, vi, beforeEach } from "vitest"
import { DeleteRecurringSeriesUseCase } from "./delete-recurring-series.use-case"
import type { IRecurringTemplateRepository } from "../ports/recurring-template-repository.port"
import type { ITransactionRepository } from "../ports/transaction-repository.port"
import type { RecurringTemplateRecord } from "../../domain/recurring-template.types"
import type { TransactionRecord } from "../../domain/transaction.types"

function makeRecurringRepo(): IRecurringTemplateRepository {
  return {
    findById: vi.fn(),
    findExecutions: vi.fn(),
    countExecutionsByStatus: vi.fn(),
    createSeries: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateExecutions: vi.fn(),
    deleteExecutions: vi.fn(),
  }
}

function makeTxRepo(): ITransactionRepository {
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

function makeTemplate(overrides: Partial<RecurringTemplateRecord> = {}): RecurringTemplateRecord {
  return {
    id: "tpl_1",
    userId: "user_1",
    frequency: "MONTHLY",
    interval: 1,
    daysOfWeek: [],
    dayOfMonth: null,
    weekOfMonth: null,
    monthOfYear: null,
    monthlyMode: null,
    count: 12,
    startDate: new Date("2026-05-01"),
    endDate: null,
    paused: false,
    pausedAt: null,
    templateAmount: 100,
    templateDescription: "X",
    templateNotes: null,
    templateType: "EXPENSE",
    templateCategoryId: "cat_1",
    templateContactId: null,
    templateAreaId: null,
    templateCategoryGroupId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function makeTx(overrides: Partial<TransactionRecord> = {}): TransactionRecord {
  return {
    id: "tx_5",
    userId: "user_1",
    description: "X",
    amount: 100,
    type: "EXPENSE",
    categoryId: "cat_1",
    date: new Date("2026-08-01"),
    status: "PENDING",
    templateId: "tpl_1",
    seriesIndex: 5,
    skipped: false,
    isException: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe("DeleteRecurringSeriesUseCase", () => {
  let recurringRepo: IRecurringTemplateRepository
  let txRepo: ITransactionRepository
  let useCase: DeleteRecurringSeriesUseCase

  beforeEach(() => {
    recurringRepo = makeRecurringRepo()
    txRepo = makeTxRepo()
    useCase = new DeleteRecurringSeriesUseCase(recurringRepo, txRepo)
  })

  it("rejeita 404 se template não existe", async () => {
    vi.mocked(recurringRepo.findById).mockResolvedValue(null)

    await expect(
      useCase.execute({
        userId: "user_1",
        templateId: "tpl_inexistente",
        applyMode: "all",
      }),
    ).rejects.toThrow("não encontrada")
    expect(recurringRepo.deleteExecutions).not.toHaveBeenCalled()
  })

  it("applyMode=single: rejeita 400 se fromTransactionId ausente", async () => {
    vi.mocked(recurringRepo.findById).mockResolvedValue(makeTemplate())

    await expect(
      useCase.execute({
        userId: "user_1",
        templateId: "tpl_1",
        applyMode: "single",
      }),
    ).rejects.toThrow("fromTransactionId")
  })

  it("applyMode=single: deleta apenas a tx referenciada via onlyId", async () => {
    vi.mocked(recurringRepo.findById).mockResolvedValue(makeTemplate())
    vi.mocked(recurringRepo.deleteExecutions).mockResolvedValue(1)

    const result = await useCase.execute({
      userId: "user_1",
      templateId: "tpl_1",
      applyMode: "single",
      fromTransactionId: "tx_5",
    })

    expect(recurringRepo.deleteExecutions).toHaveBeenCalledWith(
      "tpl_1",
      "user_1",
      { onlyId: "tx_5" },
    )
    expect(recurringRepo.delete).not.toHaveBeenCalled() // template preservado
    expect(result.deleted).toBe(1)
  })

  it("applyMode=future: rejeita 400 se fromTransactionId ausente", async () => {
    vi.mocked(recurringRepo.findById).mockResolvedValue(makeTemplate())

    await expect(
      useCase.execute({
        userId: "user_1",
        templateId: "tpl_1",
        applyMode: "future",
      }),
    ).rejects.toThrow("fromTransactionId")
  })

  it("applyMode=future: rejeita 404 se tx referência não existe", async () => {
    vi.mocked(recurringRepo.findById).mockResolvedValue(makeTemplate())
    vi.mocked(txRepo.findById).mockResolvedValue(null)

    await expect(
      useCase.execute({
        userId: "user_1",
        templateId: "tpl_1",
        applyMode: "future",
        fromTransactionId: "tx_inexistente",
      }),
    ).rejects.toThrow("Transação de referência não encontrada")
  })

  it("applyMode=future: passa fromDate da tx referência", async () => {
    vi.mocked(recurringRepo.findById).mockResolvedValue(makeTemplate())
    const reference = makeTx({ date: new Date("2026-08-01") })
    vi.mocked(txRepo.findById).mockResolvedValue(reference)
    vi.mocked(recurringRepo.deleteExecutions).mockResolvedValue(5)

    const result = await useCase.execute({
      userId: "user_1",
      templateId: "tpl_1",
      applyMode: "future",
      fromTransactionId: "tx_5",
    })

    expect(recurringRepo.deleteExecutions).toHaveBeenCalledWith(
      "tpl_1",
      "user_1",
      { fromDate: reference.date },
    )
    expect(recurringRepo.delete).not.toHaveBeenCalled() // template preservado
    expect(result.deleted).toBe(5)
  })

  it("applyMode=all: deleta todas execuções E hard-deleta o template", async () => {
    vi.mocked(recurringRepo.findById).mockResolvedValue(makeTemplate())
    vi.mocked(recurringRepo.deleteExecutions).mockResolvedValue(12)
    vi.mocked(recurringRepo.delete).mockResolvedValue(makeTemplate())

    const result = await useCase.execute({
      userId: "user_1",
      templateId: "tpl_1",
      applyMode: "all",
    })

    expect(recurringRepo.deleteExecutions).toHaveBeenCalledWith("tpl_1", "user_1", {})
    expect(recurringRepo.delete).toHaveBeenCalledWith("tpl_1", "user_1")
    expect(result.deleted).toBe(12)
  })

  it("respeita user isolation (passa userId em todas chamadas)", async () => {
    vi.mocked(recurringRepo.findById).mockResolvedValue(makeTemplate())
    vi.mocked(recurringRepo.deleteExecutions).mockResolvedValue(0)
    vi.mocked(recurringRepo.delete).mockResolvedValue(makeTemplate())

    await useCase.execute({
      userId: "user_x",
      templateId: "tpl_1",
      applyMode: "all",
    })

    expect(recurringRepo.findById).toHaveBeenCalledWith("tpl_1", "user_x")
    expect(recurringRepo.deleteExecutions).toHaveBeenCalledWith("tpl_1", "user_x", {})
    expect(recurringRepo.delete).toHaveBeenCalledWith("tpl_1", "user_x")
  })
})
