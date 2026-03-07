import { describe, expect, it } from "vitest"
import {
  normalizeContactStatus,
  normalizeContactType,
  validateContactEmail,
  validateContactName,
} from "./contact-rules"

describe("contact-rules", () => {
  it("normaliza tipo e status do contato", () => {
    expect(normalizeContactType("customer")).toBe("CUSTOMER")
    expect(normalizeContactType("SUPPLIER")).toBe("SUPPLIER")
    expect(normalizeContactStatus("active")).toBe("ACTIVE")
    expect(normalizeContactStatus("INACTIVE")).toBe("INACTIVE")
  })

  it("valida nome e email", () => {
    expect(() => validateContactName("")).toThrow("Nome do contato e obrigatorio")
    expect(() => validateContactEmail("email-invalido")).toThrow("Email do contato invalido")
    expect(() => validateContactEmail("contato@mmx.dev")).not.toThrow()
  })

  it("rejeita tipo e status invalidos", () => {
    expect(() => normalizeContactType("other")).toThrow("Tipo do contato invalido")
    expect(() => normalizeContactStatus("archived")).toThrow("Status do contato invalido")
  })
})
