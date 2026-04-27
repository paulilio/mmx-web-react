import { describe, expect, it } from "vitest"
import {
  enforceTypeSpecificFields,
  normalizeAccountStatus,
  normalizeAccountType,
  validateAccountName,
  validateCreditLimit,
  validateCurrency,
  validateDayOfMonth,
  validateOpeningBalanceDate,
} from "./account-rules"

describe("account-rules", () => {
  describe("validateAccountName", () => {
    it("aceita nome valido", () => {
      expect(() => validateAccountName("Conta")).not.toThrow()
    })

    it("rejeita nome vazio ou whitespace", () => {
      expect(() => validateAccountName("")).toThrow(/Nome/)
      expect(() => validateAccountName("   ")).toThrow(/Nome/)
    })
  })

  describe("validateCurrency", () => {
    it("aceita ISO de 3 letras", () => {
      expect(() => validateCurrency("BRL")).not.toThrow()
      expect(() => validateCurrency("USD")).not.toThrow()
    })

    it("rejeita ISO invalido", () => {
      expect(() => validateCurrency("real")).toThrow()
      expect(() => validateCurrency("BR")).toThrow()
      expect(() => validateCurrency("BRLA")).toThrow()
    })
  })

  describe("validateOpeningBalanceDate", () => {
    it("aceita data passada e atual", () => {
      expect(() => validateOpeningBalanceDate(new Date("2020-01-01"))).not.toThrow()
      expect(() => validateOpeningBalanceDate(new Date())).not.toThrow()
    })

    it("rejeita data invalida", () => {
      expect(() => validateOpeningBalanceDate(new Date("invalid"))).toThrow()
    })

    it("rejeita data muito no futuro", () => {
      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      expect(() => validateOpeningBalanceDate(future)).toThrow(/futuro/)
    })
  })

  describe("validateDayOfMonth", () => {
    it("aceita 1..31", () => {
      expect(() => validateDayOfMonth(1, "Dia")).not.toThrow()
      expect(() => validateDayOfMonth(31, "Dia")).not.toThrow()
    })

    it("rejeita fora do intervalo", () => {
      expect(() => validateDayOfMonth(0, "Dia")).toThrow()
      expect(() => validateDayOfMonth(32, "Dia")).toThrow()
      expect(() => validateDayOfMonth(1.5, "Dia")).toThrow()
    })
  })

  describe("validateCreditLimit", () => {
    it("aceita positivo", () => {
      expect(() => validateCreditLimit(1)).not.toThrow()
      expect(() => validateCreditLimit(50000)).not.toThrow()
    })

    it("rejeita zero ou negativo", () => {
      expect(() => validateCreditLimit(0)).toThrow()
      expect(() => validateCreditLimit(-100)).toThrow()
    })
  })

  describe("normalizeAccountType", () => {
    it("normaliza variantes de credit-card", () => {
      expect(normalizeAccountType("credit-card")).toBe("CREDIT_CARD")
      expect(normalizeAccountType("creditcard")).toBe("CREDIT_CARD")
      expect(normalizeAccountType("CREDIT_CARD")).toBe("CREDIT_CARD")
    })

    it("normaliza outros tipos", () => {
      expect(normalizeAccountType("checking")).toBe("CHECKING")
      expect(normalizeAccountType("Investment")).toBe("INVESTMENT")
      expect(normalizeAccountType("BUSINESS")).toBe("BUSINESS")
      expect(normalizeAccountType("cash")).toBe("CASH")
      expect(normalizeAccountType("other")).toBe("OTHER")
    })

    it("rejeita tipo invalido", () => {
      expect(() => normalizeAccountType("wallet")).toThrow()
    })
  })

  describe("normalizeAccountStatus", () => {
    it("normaliza variantes", () => {
      expect(normalizeAccountStatus("active")).toBe("ACTIVE")
      expect(normalizeAccountStatus("ARCHIVED")).toBe("ARCHIVED")
      expect(normalizeAccountStatus("pending_review")).toBe("PENDING_REVIEW")
      expect(normalizeAccountStatus("PENDING-REVIEW")).toBe("PENDING_REVIEW")
    })

    it("rejeita status invalido", () => {
      expect(() => normalizeAccountStatus("draft")).toThrow()
    })
  })

  describe("enforceTypeSpecificFields", () => {
    it("CREDIT_CARD exige todos os campos", () => {
      expect(() => enforceTypeSpecificFields("CREDIT_CARD", {})).toThrow(/limite/i)
      expect(() => enforceTypeSpecificFields("CREDIT_CARD", { creditLimit: 1000 })).toThrow(/fechamento/i)
      expect(() => enforceTypeSpecificFields("CREDIT_CARD", { creditLimit: 1000, closingDay: 5 })).toThrow(/vencimento/i)
      expect(() => enforceTypeSpecificFields("CREDIT_CARD", { creditLimit: 1000, closingDay: 5, dueDay: 12 })).not.toThrow()
    })

    it("non-CREDIT_CARD rejeita campos de cartao", () => {
      expect(() => enforceTypeSpecificFields("CHECKING", { creditLimit: 1000 })).toThrow()
      expect(() => enforceTypeSpecificFields("SAVINGS", { closingDay: 5 })).toThrow()
      expect(() => enforceTypeSpecificFields("INVESTMENT", { dueDay: 12 })).toThrow()
    })

    it("non-CREDIT_CARD aceita ausencia de campos", () => {
      expect(() => enforceTypeSpecificFields("CHECKING", {})).not.toThrow()
      expect(() => enforceTypeSpecificFields("BUSINESS", { creditLimit: null, closingDay: null, dueDay: null })).not.toThrow()
    })
  })
})
