import { describe, expect, it } from "vitest"
import { AccountEntity } from "./account-entity"

const BASE_INPUT = {
  userId: "user-1",
  name: "BB Corrente",
  type: "checking",
}

describe("AccountEntity", () => {
  it("create defaulta status ACTIVE, currency BRL e openingBalance 0", () => {
    const e = AccountEntity.create(BASE_INPUT)
    expect(e.value.status).toBe("ACTIVE")
    expect(e.value.currency).toBe("BRL")
    expect(e.value.openingBalance).toBe(0)
    expect(e.value.type).toBe("CHECKING")
    expect(e.value.isBusiness).toBe(false)
  })

  it("create normaliza tipos de cliente para enum interno", () => {
    expect(AccountEntity.create({ ...BASE_INPUT, type: "credit-card", creditLimit: 5000, closingDay: 5, dueDay: 12 }).value.type).toBe("CREDIT_CARD")
    expect(AccountEntity.create({ ...BASE_INPUT, type: "INVESTMENT", name: "BB Invest" }).value.type).toBe("INVESTMENT")
    expect(AccountEntity.create({ ...BASE_INPUT, type: "savings", name: "Poupanca" }).value.type).toBe("SAVINGS")
    expect(AccountEntity.create({ ...BASE_INPUT, type: "business", name: "CNPJ" }).value.type).toBe("BUSINESS")
  })

  it("create marca isBusiness=true para type=BUSINESS", () => {
    const e = AccountEntity.create({ ...BASE_INPUT, name: "CNPJ", type: "business" })
    expect(e.value.isBusiness).toBe(true)
  })

  it("create exige nome", () => {
    expect(() => AccountEntity.create({ ...BASE_INPUT, name: "  " })).toThrow(/Nome/)
  })

  it("create rejeita tipo invalido", () => {
    expect(() => AccountEntity.create({ ...BASE_INPUT, type: "wallet" })).toThrow(/Tipo/)
  })

  it("create rejeita currency invalida", () => {
    expect(() => AccountEntity.create({ ...BASE_INPUT, currency: "real" })).toThrow(/Moeda/)
  })

  it("create rejeita openingBalanceDate no futuro", () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    expect(() => AccountEntity.create({ ...BASE_INPUT, openingBalanceDate: future })).toThrow(/futuro/)
  })

  it("create de CREDIT_CARD exige creditLimit, closingDay e dueDay", () => {
    expect(() => AccountEntity.create({ ...BASE_INPUT, type: "credit-card", name: "Nubank" })).toThrow(/limite/i)
    expect(() => AccountEntity.create({ ...BASE_INPUT, type: "credit-card", name: "Nubank", creditLimit: 1000 })).toThrow(/fechamento/i)
    expect(() => AccountEntity.create({ ...BASE_INPUT, type: "credit-card", name: "Nubank", creditLimit: 1000, closingDay: 5 })).toThrow(/vencimento/i)
  })

  it("create rejeita CREDIT_CARD com closingDay fora de 1..31", () => {
    expect(() =>
      AccountEntity.create({ ...BASE_INPUT, type: "credit-card", name: "Nubank", creditLimit: 1000, closingDay: 32, dueDay: 12 }),
    ).toThrow(/fechamento/i)
    expect(() =>
      AccountEntity.create({ ...BASE_INPUT, type: "credit-card", name: "Nubank", creditLimit: 1000, closingDay: 0, dueDay: 12 }),
    ).toThrow(/fechamento/i)
  })

  it("create rejeita creditLimit negativo", () => {
    expect(() =>
      AccountEntity.create({ ...BASE_INPUT, type: "credit-card", name: "Nubank", creditLimit: -100, closingDay: 5, dueDay: 12 }),
    ).toThrow(/Limite/i)
  })

  it("create rejeita campos de cartao em conta nao-CREDIT_CARD", () => {
    expect(() => AccountEntity.create({ ...BASE_INPUT, creditLimit: 100 })).toThrow(/CREDIT_CARD/)
    expect(() => AccountEntity.create({ ...BASE_INPUT, closingDay: 5 })).toThrow(/CREDIT_CARD/)
    expect(() => AccountEntity.create({ ...BASE_INPUT, dueDay: 12 })).toThrow(/CREDIT_CARD/)
  })

  it("create aceita cartao de credito com todos os campos", () => {
    const e = AccountEntity.create({
      ...BASE_INPUT,
      name: "Nubank",
      type: "credit-card",
      creditLimit: 5000,
      closingDay: 5,
      dueDay: 12,
    })
    expect(e.value.type).toBe("CREDIT_CARD")
    expect(e.value.creditLimit).toBe(5000)
    expect(e.value.closingDay).toBe(5)
    expect(e.value.dueDay).toBe(12)
  })

  it("buildUpdatePayload aplica trim e normalizacao", () => {
    const e = AccountEntity.create(BASE_INPUT)
    const payload = e.buildUpdatePayload({ name: "  BB Conta  ", status: "archived" })
    expect(payload.name).toBe("BB Conta")
    expect(payload.status).toBe("ARCHIVED")
  })

  it("buildUpdatePayload bloqueia mudanca para CREDIT_CARD sem campos", () => {
    const e = AccountEntity.create(BASE_INPUT)
    expect(() => e.buildUpdatePayload({ type: "credit-card" })).toThrow(/limite/i)
  })

  it("buildUpdatePayload permite mudanca para CREDIT_CARD com todos os campos", () => {
    const e = AccountEntity.create(BASE_INPUT)
    const payload = e.buildUpdatePayload({ type: "credit-card", creditLimit: 1000, closingDay: 5, dueDay: 12 })
    expect(payload.type).toBe("CREDIT_CARD")
    expect(payload.creditLimit).toBe(1000)
    expect(payload.isBusiness).toBe(false)
  })

  it("archive retorna payload com status ARCHIVED e archivedAt", () => {
    const e = AccountEntity.create(BASE_INPUT)
    const payload = e.archive()
    expect(payload.status).toBe("ARCHIVED")
    expect(payload.archivedAt).toBeInstanceOf(Date)
  })
})
