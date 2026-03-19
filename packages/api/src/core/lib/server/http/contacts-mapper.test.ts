import { describe, expect, it } from "vitest"
import {
  mapContact,
  parseContactStatus,
  parseContactType,
} from "./contacts-mapper"

describe("contacts-mapper", () => {
  it("parseContactType e parseContactStatus aceitam valores validos", () => {
    expect(parseContactType("customer")).toBe("CUSTOMER")
    expect(parseContactType(" SUPPLIER ")).toBe("SUPPLIER")
    expect(parseContactStatus("active")).toBe("ACTIVE")
    expect(parseContactStatus(" INACTIVE ")).toBe("INACTIVE")
  })

  it("parseContactType e parseContactStatus rejeitam valores invalidos", () => {
    expect(() => parseContactType("other")).toThrow("Tipo do contato invalido")
    expect(() => parseContactStatus("archived")).toThrow("Status do contato invalido")
  })

  it("mapContact converte payload para cliente", () => {
    const mapped = mapContact({
      id: "contact-1",
      userId: "user-1",
      name: "Cliente Alpha",
      email: "alpha@mmx.dev",
      phone: "11999999999",
      identifier: "12345678901",
      type: "CUSTOMER",
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    expect(mapped).toEqual({
      id: "contact-1",
      userId: "user-1",
      name: "Cliente Alpha",
      email: "alpha@mmx.dev",
      phone: "11999999999",
      identifier: "12345678901",
      document: "12345678901",
      type: "customer",
      status: "active",
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-02T00:00:00.000Z",
    })
  })
})
