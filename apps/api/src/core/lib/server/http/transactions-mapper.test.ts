import { describe, expect, it } from "vitest"
import {
  mapTransaction,
  parseTransactionStatus,
  parseTransactionType,
} from "./transactions-mapper"

describe("transactions-mapper", () => {
  it("parseTransactionType aceita valores validos", () => {
    expect(parseTransactionType("income")).toBe("INCOME")
    expect(parseTransactionType(" EXPENSE ")).toBe("EXPENSE")
    expect(parseTransactionType(undefined)).toBeUndefined()
  })

  it("parseTransactionStatus aceita valores validos", () => {
    expect(parseTransactionStatus("pending")).toBe("PENDING")
    expect(parseTransactionStatus(" COMPLETED ")).toBe("COMPLETED")
    expect(parseTransactionStatus(null)).toBeUndefined()
  })

  it("parseTransactionType e parseTransactionStatus rejeitam valores invalidos", () => {
    expect(() => parseTransactionType("other")).toThrow("Tipo da transacao invalido")
    expect(() => parseTransactionStatus("archived")).toThrow("Status da transacao invalido")
    expect(() => parseTransactionType(123)).toThrow("Tipo da transacao invalido")
    expect(() => parseTransactionStatus({})).toThrow("Status da transacao invalido")
  })

  it("mapTransaction converte payload para contrato de cliente", () => {
    const mapped = mapTransaction({
      id: "tx-1",
      userId: "user-1",
      description: "Recebimento",
      amount: "199.90",
      type: "INCOME",
      categoryId: "cat-1",
      contactId: null,
      date: new Date("2026-03-10T12:00:00.000Z"),
      status: "COMPLETED",
      notes: "Parcela unica",
      recurrence: { frequency: "monthly" },
      areaId: "area-1",
      categoryGroupId: "cg-1",
      createdAt: new Date("2026-03-10T12:00:00.000Z"),
      updatedAt: new Date("2026-03-11T09:30:00.000Z"),
    })

    expect(mapped).toEqual({
      id: "tx-1",
      userId: "user-1",
      description: "Recebimento",
      amount: 199.9,
      type: "income",
      categoryId: "cat-1",
      contactId: null,
      date: "2026-03-10",
      status: "completed",
      notes: "Parcela unica",
      recurrence: { frequency: "monthly" },
      areaId: "area-1",
      categoryGroupId: "cg-1",
      createdAt: "2026-03-10T12:00:00.000Z",
      updatedAt: "2026-03-11T09:30:00.000Z",
    })
  })
})
