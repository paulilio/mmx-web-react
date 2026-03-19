import { describe, expect, it } from "vitest"
import { mapBudget, mapBudgetAllocation } from "./budgets-mapper"

describe("budgets-mapper", () => {
  it("mapBudget converte decimais e datas", () => {
    const mapped = mapBudget({
      id: "budget-1",
      userId: "user-1",
      categoryGroupId: "group-1",
      month: 3,
      year: 2026,
      planned: "1000.50",
      funded: "800.25",
      spent: "300.00",
      rolloverEnabled: true,
      rolloverAmount: "100.00",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    expect(mapped.planned).toBe(1000.5)
    expect(mapped.rolloverAmount).toBe(100)
    expect(mapped.createdAt).toBe("2026-03-01T00:00:00.000Z")
  })

  it("mapBudgetAllocation converte payload para contrato cliente", () => {
    const mapped = mapBudgetAllocation({
      id: "alloc-1",
      userId: "user-1",
      budgetGroupId: "group-1",
      month: "2026-03",
      plannedAmount: "500",
      fundedAmount: "400",
      spentAmount: "100",
      availableAmount: "300",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    expect(mapped.planned_amount).toBe(500)
    expect(mapped.available_amount).toBe(300)
    expect(mapped.updated_at).toBe("2026-03-02T00:00:00.000Z")
  })
})
