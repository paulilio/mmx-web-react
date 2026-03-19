import { describe, expect, it } from "vitest"
import { mapArea, parseAreaStatus, parseAreaType } from "./areas-mapper"

describe("areas-mapper", () => {
  it("parseAreaType e parseAreaStatus aceitam valores válidos", () => {
    expect(parseAreaType("income")).toBe("INCOME")
    expect(parseAreaType("daily-expenses")).toBe("DAILY_EXPENSES")
    expect(parseAreaStatus("active")).toBe("ACTIVE")
  })

  it("mapArea converte payload para contrato cliente", () => {
    const mapped = mapArea({
      id: "area-1",
      userId: "user-1",
      name: "Moradia",
      description: null,
      type: "FIXED_EXPENSES",
      color: "#3b82f6",
      icon: "home",
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    expect(mapped.type).toBe("fixed-expenses")
    expect(mapped.status).toBe("active")
    expect(mapped.updatedAt).toBe("2026-03-02T00:00:00.000Z")
  })
})
