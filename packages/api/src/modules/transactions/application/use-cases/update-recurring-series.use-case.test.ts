import { describe, expect, it, vi, beforeEach } from "vitest"
import { UpdateRecurringSeriesUseCase } from "./update-recurring-series.use-case"
import type { IRecurringTemplateRepository } from "../ports/recurring-template-repository.port"
import type { RecurringTemplateRecord } from "../../domain/recurring-template.types"

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

describe("UpdateRecurringSeriesUseCase", () => {
  let repo: IRecurringTemplateRepository
  let useCase: UpdateRecurringSeriesUseCase

  beforeEach(() => {
    repo = makeRepo()
    useCase = new UpdateRecurringSeriesUseCase(repo)
  })

  it("applyMode=all atualiza execuções sem filtro de data e atualiza snapshot", async () => {
    const template = makeTemplate()
    vi.mocked(repo.findById).mockResolvedValue(template)
    vi.mocked(repo.updateExecutions).mockResolvedValue(12)
    vi.mocked(repo.update).mockResolvedValue({ ...template, templateAmount: 200, templateDescription: "Atualizado" })

    const result = await useCase.execute({
      userId: "user_1",
      templateId: "tpl_1",
      applyMode: "all",
      patch: { amount: 200, description: "Atualizado" },
    })

    expect(result.updated).toBe(12)
    expect(repo.updateExecutions).toHaveBeenCalledWith(
      "tpl_1",
      "user_1",
      expect.objectContaining({ fromDate: undefined, preserveExceptions: true }),
      expect.objectContaining({ amount: 200, description: "Atualizado" }),
    )
    // Snapshot do template foi atualizado
    expect(repo.update).toHaveBeenCalledWith(
      "tpl_1",
      "user_1",
      expect.objectContaining({ templateAmount: 200, templateDescription: "Atualizado" }),
    )
  })

  it("applyMode=future passa fromDate pro repo", async () => {
    const template = makeTemplate()
    vi.mocked(repo.findById).mockResolvedValue(template)
    vi.mocked(repo.updateExecutions).mockResolvedValue(5)
    vi.mocked(repo.update).mockResolvedValue(template)

    const fromDate = new Date("2026-08-01")
    await useCase.execute({
      userId: "user_1",
      templateId: "tpl_1",
      applyMode: "future",
      fromDate,
      patch: { status: "COMPLETED" },
    })

    expect(repo.updateExecutions).toHaveBeenCalledWith(
      "tpl_1",
      "user_1",
      expect.objectContaining({ fromDate, preserveExceptions: true }),
      expect.objectContaining({ status: "COMPLETED" }),
    )
  })

  it("rejeita 400 quando applyMode=future sem fromDate", async () => {
    vi.mocked(repo.findById).mockResolvedValue(makeTemplate())

    await expect(
      useCase.execute({
        userId: "user_1",
        templateId: "tpl_1",
        applyMode: "future",
        patch: { amount: 200 },
      }),
    ).rejects.toThrow("fromDate")

    expect(repo.updateExecutions).not.toHaveBeenCalled()
  })

  it("rejeita 404 quando template não existe", async () => {
    vi.mocked(repo.findById).mockResolvedValue(null)

    await expect(
      useCase.execute({
        userId: "user_1",
        templateId: "tpl_inexistente",
        applyMode: "all",
        patch: { amount: 200 },
      }),
    ).rejects.toThrow("não encontrada")
  })

  it("preserveExceptions=false quando explicitamente desativado", async () => {
    vi.mocked(repo.findById).mockResolvedValue(makeTemplate())
    vi.mocked(repo.updateExecutions).mockResolvedValue(12)
    vi.mocked(repo.update).mockResolvedValue(makeTemplate())

    await useCase.execute({
      userId: "user_1",
      templateId: "tpl_1",
      applyMode: "all",
      patch: { amount: 200 },
      preserveExceptions: false,
    })

    expect(repo.updateExecutions).toHaveBeenCalledWith(
      "tpl_1",
      "user_1",
      expect.objectContaining({ preserveExceptions: false }),
      expect.anything(),
    )
  })

  it("retorna template original se update do snapshot falhar (graceful degradation)", async () => {
    const template = makeTemplate()
    vi.mocked(repo.findById).mockResolvedValue(template)
    vi.mocked(repo.updateExecutions).mockResolvedValue(12)
    vi.mocked(repo.update).mockResolvedValue(null) // simula concorrência: alguém apagou template entre updateExecutions e update

    const result = await useCase.execute({
      userId: "user_1",
      templateId: "tpl_1",
      applyMode: "all",
      patch: { amount: 200 },
    })

    expect(result.template).toBe(template)
  })
})
