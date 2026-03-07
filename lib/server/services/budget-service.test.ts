import { describe, expect, it, vi } from "vitest"
import { BudgetService } from "./budget-service"

function createRepositoryMock() {
  return {
    findMany: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

describe("BudgetService", () => {
  it("cria orçamento com normalização de domínio", async () => {
    const repository = createRepositoryMock()
    const allocationRepo = createRepositoryMock()
    const service = new BudgetService(repository as never, allocationRepo as never)

    vi.mocked(repository.create).mockResolvedValue({ id: "b-1" })

    await service.create({
      userId: "user-1",
      categoryGroupId: "group-1",
      month: 3,
      year: 2026,
      planned: 1000,
      funded: 800,
      rolloverEnabled: true,
    })

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        month: 3,
        year: 2026,
        rolloverEnabled: true,
      }),
    )
  })

  it("falha no update quando orçamento não existe", async () => {
    const repository = createRepositoryMock()
    const allocationRepo = createRepositoryMock()
    const service = new BudgetService(repository as never, allocationRepo as never)

    vi.mocked(repository.findById).mockResolvedValue(null)

    await expect(service.update("b-404", "user-1", { planned: 10 })).rejects.toThrow(
      "Orçamento não encontrado para este usuário",
    )
  })
})
