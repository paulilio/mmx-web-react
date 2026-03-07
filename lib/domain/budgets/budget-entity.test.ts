import { describe, expect, it } from "vitest"
import { BudgetEntity } from "./budget-entity"

describe("BudgetEntity", () => {
  it("cria orçamento válido", () => {
    const entity = BudgetEntity.create({
      userId: "user-1",
      categoryGroupId: "group-1",
      month: 3,
      year: 2026,
      planned: 1000,
      funded: 500,
    })

    expect(entity.value.userId).toBe("user-1")
    expect(entity.value.month).toBe(3)
    expect(entity.value.rolloverEnabled).toBe(false)
  })

  it("monta payload de update", () => {
    const entity = BudgetEntity.create({
      userId: "user-1",
      categoryGroupId: "group-1",
      month: 3,
      year: 2026,
      planned: 1000,
      funded: 500,
    })

    const payload = entity.buildUpdatePayload({ planned: 1200, rolloverEnabled: true })

    expect(payload.planned).toBe(1200)
    expect(payload.rolloverEnabled).toBe(true)
  })

  it("valida mês inválido", () => {
    expect(() =>
      BudgetEntity.create({
        userId: "user-1",
        categoryGroupId: "group-1",
        month: 13,
        year: 2026,
        planned: 100,
        funded: 100,
      }),
    ).toThrow("Mês do orçamento invalido")
  })
})
