import { describe, expect, it } from "vitest"
import {
  applyTransactionToBalance,
  ensureExpenseWithinBalance,
  validateAmount,
  validateRequiredFields,
  validateStatusTransition,
  validateTransactionDate,
} from "./transaction-rules"

describe("transaction-rules", () => {
  it("ensureExpenseWithinBalance throws when expense exceeds balance", () => {
    expect(() => ensureExpenseWithinBalance("EXPENSE", 120, 100)).toThrow("Saldo insuficiente")
  })

  it("ensureExpenseWithinBalance allows income regardless of balance", () => {
    expect(() => ensureExpenseWithinBalance("INCOME", 120, 100)).not.toThrow()
  })

  it("validateAmount rejects non-positive values", () => {
    expect(() => validateAmount(0)).toThrow("maior que zero")
    expect(() => validateAmount(-1)).toThrow("maior que zero")
  })

  it("validateRequiredFields rejects empty fields", () => {
    expect(() => validateRequiredFields({ userId: "", categoryId: "cat", description: "Desc" })).toThrow(
      "Usuario da transacao",
    )
    expect(() => validateRequiredFields({ userId: "user", categoryId: "", description: "Desc" })).toThrow(
      "Categoria da transacao",
    )
  })

  it("validateTransactionDate rejects invalid date", () => {
    expect(() => validateTransactionDate(new Date("invalid-date"))).toThrow("Data da transacao invalida")
  })

  it("validateStatusTransition rejects invalid transition", () => {
    expect(() => validateStatusTransition("CANCELLED", "PENDING")).toThrow("nao permitida")
  })

  it("applyTransactionToBalance calculates correctly", () => {
    expect(applyTransactionToBalance(100, "EXPENSE", 30)).toBe(70)
    expect(applyTransactionToBalance(100, "INCOME", 30)).toBe(130)
  })
})
