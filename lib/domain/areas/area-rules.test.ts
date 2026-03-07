import { describe, expect, it } from "vitest"
import { normalizeAreaStatus, normalizeAreaType, validateAreaColor, validateAreaIcon, validateAreaName } from "./area-rules"

describe("area-rules", () => {
  it("normaliza tipos válidos", () => {
    expect(normalizeAreaType("income")).toBe("INCOME")
    expect(normalizeAreaType("fixed-expenses")).toBe("FIXED_EXPENSES")
    expect(normalizeAreaType("dailyExpenses")).toBe("DAILY_EXPENSES")
    expect(normalizeAreaType("taxes-fees")).toBe("TAXES_FEES")
  })

  it("normaliza status válido", () => {
    expect(normalizeAreaStatus("active")).toBe("ACTIVE")
    expect(normalizeAreaStatus("INACTIVE")).toBe("INACTIVE")
  })

  it("valida obrigatórios e rejeita tipo inválido", () => {
    expect(() => validateAreaName(" ")).toThrow("Nome da area e obrigatorio")
    expect(() => validateAreaColor(" ")).toThrow("Cor da area e obrigatoria")
    expect(() => validateAreaIcon(" ")).toThrow("Icone da area e obrigatorio")
    expect(() => normalizeAreaType("other")).toThrow("Tipo da area invalido")
  })
})
