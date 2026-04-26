import { describe, expect, it, vi, beforeEach } from "vitest"
import { CreateRecurringSeriesUseCase } from "./create-recurring-series.use-case"
import type {
  IRecurringTemplateRepository,
  CreateRecurringSeriesData,
} from "../ports/recurring-template-repository.port"
import type { RecurringTemplateRecord } from "../../domain/recurring-template.types"
import type { TransactionRecord } from "../../domain/transaction.types"

function makeRepo(): IRecurringTemplateRepository {
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
    count: 3,
    startDate: new Date("2026-05-01"),
    endDate: null,
    paused: false,
    pausedAt: null,
    templateAmount: 100,
    templateDescription: "Aluguel",
    templateNotes: null,
    templateType: "EXPENSE",
    templateCategoryId: "cat_1",
    templateContactId: null,
    templateAreaId: null,
    templateCategoryGroupId: null,
    createdAt: new Date("2026-04-01T10:00:00.000Z"),
    updatedAt: new Date("2026-04-01T10:00:00.000Z"),
    ...overrides,
  }
}

function makeTransaction(overrides: Partial<TransactionRecord> = {}): TransactionRecord {
  return {
    id: "tx_1",
    userId: "user_1",
    description: "Aluguel",
    amount: 100,
    type: "EXPENSE",
    categoryId: "cat_1",
    date: new Date("2026-05-01"),
    status: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe("CreateRecurringSeriesUseCase", () => {
  let repo: IRecurringTemplateRepository
  let useCase: CreateRecurringSeriesUseCase

  beforeEach(() => {
    repo = makeRepo()
    useCase = new CreateRecurringSeriesUseCase(repo)
  })

  it("gera N execuções a partir da regra e chama repo.createSeries", async () => {
    const template = makeTemplate({ count: 3 })
    const executions = [
      makeTransaction({ id: "tx_1", date: new Date("2026-05-01") }),
      makeTransaction({ id: "tx_2", date: new Date("2026-06-01") }),
      makeTransaction({ id: "tx_3", date: new Date("2026-07-01") }),
    ]
    vi.mocked(repo.createSeries).mockResolvedValue({ template, executions })

    const result = await useCase.execute({
      userId: "user_1",
      template: {
        userId: "user_1",
        frequency: "MONTHLY",
        interval: 1,
        count: 3,
        startDate: new Date("2026-05-01"),
        templateAmount: 100,
        templateDescription: "Aluguel",
        templateType: "EXPENSE",
        templateCategoryId: "cat_1",
      },
      base: {
        description: "Aluguel",
        amount: 100,
        type: "EXPENSE",
        categoryId: "cat_1",
        status: "PENDING",
      },
    })

    expect(result.executions).toHaveLength(3)
    expect(repo.createSeries).toHaveBeenCalledTimes(1)
    const call = vi.mocked(repo.createSeries).mock.calls[0]?.[0] as CreateRecurringSeriesData
    expect(call.executions).toHaveLength(3)
    expect(call.executions[0]?.userId).toBe("user_1")
    expect(call.executions[0]?.amount).toBe(100)
  })

  it("rejeita 403 se userId != template.userId", async () => {
    await expect(
      useCase.execute({
        userId: "user_other",
        template: {
          userId: "user_1",
          frequency: "MONTHLY",
          interval: 1,
          count: 3,
          startDate: new Date("2026-05-01"),
          templateAmount: 100,
          templateDescription: "X",
          templateType: "EXPENSE",
          templateCategoryId: "cat_1",
        },
        base: {
          description: "X",
          amount: 100,
          type: "EXPENSE",
          categoryId: "cat_1",
          status: "PENDING",
        },
      }),
    ).rejects.toThrow("User não autorizado")

    expect(repo.createSeries).not.toHaveBeenCalled()
  })

  it("rejeita 400 EMPTY_RECURRENCE quando endDate antes do startDate (zero datas)", async () => {
    await expect(
      useCase.execute({
        userId: "user_1",
        template: {
          userId: "user_1",
          frequency: "MONTHLY",
          interval: 1,
          startDate: new Date("2026-05-15"),
          endDate: new Date("2026-05-01"), // antes do start
          templateAmount: 100,
          templateDescription: "X",
          templateType: "EXPENSE",
          templateCategoryId: "cat_1",
        },
        base: {
          description: "X",
          amount: 100,
          type: "EXPENSE",
          categoryId: "cat_1",
          status: "PENDING",
        },
      }),
    ).rejects.toThrow("Nenhuma ocorrência")

    expect(repo.createSeries).not.toHaveBeenCalled()
  })

  it("propaga erro do repo (atomicidade falha = rollback no DB)", async () => {
    vi.mocked(repo.createSeries).mockRejectedValue(new Error("transaction timeout"))

    await expect(
      useCase.execute({
        userId: "user_1",
        template: {
          userId: "user_1",
          frequency: "MONTHLY",
          interval: 1,
          count: 2,
          startDate: new Date("2026-05-01"),
          templateAmount: 100,
          templateDescription: "X",
          templateType: "EXPENSE",
          templateCategoryId: "cat_1",
        },
        base: {
          description: "X",
          amount: 100,
          type: "EXPENSE",
          categoryId: "cat_1",
          status: "PENDING",
        },
      }),
    ).rejects.toThrow("transaction timeout")
  })

  it("propaga daysOfWeek pra geração de datas (semanal segunda+quarta)", async () => {
    const template = makeTemplate({ frequency: "WEEKLY", interval: 1, count: 4 })
    vi.mocked(repo.createSeries).mockResolvedValue({ template, executions: [] })

    await useCase.execute({
      userId: "user_1",
      template: {
        userId: "user_1",
        frequency: "WEEKLY",
        interval: 1,
        daysOfWeek: ["MONDAY", "WEDNESDAY"],
        count: 4,
        startDate: new Date("2026-05-04"), // segunda
        templateAmount: 100,
        templateDescription: "X",
        templateType: "EXPENSE",
        templateCategoryId: "cat_1",
      },
      base: {
        description: "X",
        amount: 100,
        type: "EXPENSE",
        categoryId: "cat_1",
        status: "PENDING",
      },
    })

    const call = vi.mocked(repo.createSeries).mock.calls[0]?.[0] as CreateRecurringSeriesData
    // Espera 4 datas: 2026-05-04 (seg), 06 (qua), 11 (seg), 13 (qua)
    expect(call.executions).toHaveLength(4)
    expect(call.executions[0]?.date.toISOString().split("T")[0]).toBe("2026-05-04")
    expect(call.executions[1]?.date.toISOString().split("T")[0]).toBe("2026-05-06")
    expect(call.executions[3]?.date.toISOString().split("T")[0]).toBe("2026-05-13")
  })
})
