import { describe, expect, it } from "vitest"
import { normalizeCategoryStatus, normalizeCategoryType } from "./category-rules"

describe("category-rules", () => {
  it("normaliza tipo de categoria", () => {
    expect(normalizeCategoryType("income")).toBe("INCOME")
    expect(normalizeCategoryType("EXPENSE")).toBe("EXPENSE")
  })

  it("normaliza status de categoria", () => {
    expect(normalizeCategoryStatus("active")).toBe("ACTIVE")
    expect(normalizeCategoryStatus("INACTIVE")).toBe("INACTIVE")
  })

  it("rejeita tipo invalido", () => {
    expect(() => normalizeCategoryType("other")).toThrow("Tipo da categoria invalido")
  })

  it("rejeita status invalido", () => {
    expect(() => normalizeCategoryStatus("archived")).toThrow("Status da categoria invalido")
  })
})
