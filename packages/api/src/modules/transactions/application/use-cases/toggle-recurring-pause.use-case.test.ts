import { describe, expect, it, vi, beforeEach } from "vitest"
import { ToggleRecurringPauseUseCase } from "./toggle-recurring-pause.use-case"
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

describe("ToggleRecurringPauseUseCase", () => {
  let repo: IRecurringTemplateRepository
  let useCase: ToggleRecurringPauseUseCase

  beforeEach(() => {
    repo = makeRepo()
    useCase = new ToggleRecurringPauseUseCase(repo)
  })

  it("paused=true seta pausedAt e propaga ao repo", async () => {
    const template = makeTemplate({ paused: true, pausedAt: new Date() })
    vi.mocked(repo.update).mockResolvedValue(template)

    const result = await useCase.execute("user_1", "tpl_1", true)

    expect(result.paused).toBe(true)
    expect(repo.update).toHaveBeenCalledWith(
      "tpl_1",
      "user_1",
      expect.objectContaining({ paused: true, pausedAt: expect.any(Date) }),
    )
  })

  it("paused=false zera pausedAt", async () => {
    const template = makeTemplate({ paused: false, pausedAt: null })
    vi.mocked(repo.update).mockResolvedValue(template)

    await useCase.execute("user_1", "tpl_1", false)

    expect(repo.update).toHaveBeenCalledWith(
      "tpl_1",
      "user_1",
      expect.objectContaining({ paused: false, pausedAt: null }),
    )
  })

  it("rejeita 404 quando template não existe (repo.update retorna null)", async () => {
    vi.mocked(repo.update).mockResolvedValue(null)

    await expect(useCase.execute("user_1", "tpl_inexistente", true)).rejects.toThrow(
      "não encontrada",
    )
  })

  it("respeita user isolation (passa userId pra query)", async () => {
    const template = makeTemplate()
    vi.mocked(repo.update).mockResolvedValue(template)

    await useCase.execute("user_1", "tpl_1", true)

    expect(repo.update).toHaveBeenCalledWith("tpl_1", "user_1", expect.anything())
  })
})
