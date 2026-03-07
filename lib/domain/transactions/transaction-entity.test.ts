import { describe, expect, it } from "vitest"
import { TransactionEntity } from "./transaction-entity"

describe("TransactionEntity", () => {
  it("expense cannot exceed account balance", () => {
    expect(() =>
      TransactionEntity.create(
        {
          userId: "user-1",
          description: "Compra",
          amount: 150,
          type: "EXPENSE",
          categoryId: "cat-1",
          date: "2026-03-06",
        },
        100,
      ),
    ).toThrow("Saldo insuficiente")
  })

  it("valid transaction creation", () => {
    const entity = TransactionEntity.create({
      userId: "user-1",
      description: "Recebimento",
      amount: 200,
      type: "INCOME",
      categoryId: "cat-1",
      date: "2026-03-06",
    })

    expect(entity.value.userId).toBe("user-1")
    expect(entity.value.status).toBe("PENDING")
    expect(entity.value.amount).toBe(200)
    expect(entity.signedAmount).toBe(200)
  })

  it("invalid status transition", () => {
    const entity = TransactionEntity.fromRecord({
      userId: "user-1",
      description: "Pagamento",
      amount: 50,
      type: "EXPENSE",
      categoryId: "cat-1",
      date: new Date("2026-03-06"),
      status: "CANCELLED",
    })

    expect(() =>
      entity.buildUpdatePayload({
        status: "PENDING",
      }),
    ).toThrow("Mudanca de status")
  })

  it("update payload generation", () => {
    const entity = TransactionEntity.fromRecord({
      userId: "user-1",
      description: "Assinatura",
      amount: 80,
      type: "EXPENSE",
      categoryId: "cat-1",
      date: new Date("2026-03-06"),
      status: "PENDING",
    })

    const payload = entity.buildUpdatePayload({
      amount: 90,
      notes: "Ajuste de valor",
      date: "2026-03-07",
      status: "COMPLETED",
    })

    expect(payload.amount).toBe(90)
    expect(payload.notes).toBe("Ajuste de valor")
    expect(payload.status).toBe("COMPLETED")
    expect(payload.date).toBeInstanceOf(Date)
    expect(payload.date?.toISOString().slice(0, 10)).toBe("2026-03-07")
  })
})
