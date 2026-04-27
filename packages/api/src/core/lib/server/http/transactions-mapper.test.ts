import { describe, expect, it } from "vitest"
import { mapTransaction, parseTransactionStatus, parseTransactionType } from "./transactions-mapper"

describe("transactions-mapper", () => {
  it("parseTransactionType e parseTransactionStatus aceitam valores validos", () => {
    expect(parseTransactionType("income")).toBe("INCOME")
    expect(parseTransactionType(" EXPENSE ")).toBe("EXPENSE")
    expect(parseTransactionType("transfer")).toBe("TRANSFER")
    expect(parseTransactionStatus("completed")).toBe("COMPLETED")
    expect(parseTransactionStatus(" PENDING ")).toBe("PENDING")
    expect(parseTransactionStatus("CANCELLED")).toBe("CANCELLED")
  })

  it("parseTransactionType e parseTransactionStatus rejeitam valores invalidos", () => {
    expect(() => parseTransactionType("draft")).toThrow("Tipo da transacao invalido")
    expect(() => parseTransactionStatus("archived")).toThrow("Status da transacao invalido")
  })

  it("mapTransaction inclui recurrence (bug fix: campo era omitido na response)", () => {
    const recurrence = {
      enabled: true,
      frequency: "monthly",
      interval: 1,
      count: 12,
      generatedFrom: "tx-parent",
    }

    const mapped = mapTransaction({
      id: "tx-1",
      userId: "user-1",
      description: "Aluguel",
      amount: 2500,
      type: "EXPENSE",
      categoryId: "cat-1",
      contactId: null,
      date: new Date("2026-04-15T00:00:00.000Z"),
      status: "PENDING",
      notes: null,
      areaId: null,
      categoryGroupId: null,
      recurrence,
      createdAt: new Date("2026-04-01T00:00:00.000Z"),
      updatedAt: new Date("2026-04-01T00:00:00.000Z"),
    })

    expect(mapped.recurrence).toEqual(recurrence)
    expect(mapped.id).toBe("tx-1")
    expect(mapped.amount).toBe(2500)
    expect(mapped.type).toBe("expense")
    expect(mapped.status).toBe("pending")
  })

  it("mapTransaction retorna recurrence null quando ausente", () => {
    const mapped = mapTransaction({
      id: "tx-2",
      userId: "user-1",
      description: "Compra simples",
      amount: 100,
      type: "EXPENSE",
      categoryId: "cat-1",
      date: new Date("2026-04-20T00:00:00.000Z"),
      status: "COMPLETED",
      createdAt: new Date("2026-04-20T00:00:00.000Z"),
      updatedAt: new Date("2026-04-20T00:00:00.000Z"),
    })

    expect(mapped.recurrence).toBeNull()
  })
})
