import { describe, expect, it } from "vitest"
import { BankConnectionEntity } from "./bank-connection-entity"

const VALID_INPUT = {
  userId: "user-1",
  provider: "belvo",
  providerLinkId: "link-uuid",
  institutionCode: "ofmockbank_br_retail",
  institutionName: "OF Mock Bank by Raidiam",
}

describe("BankConnectionEntity", () => {
  it("create cria entidade com status SYNCING", () => {
    const e = BankConnectionEntity.create(VALID_INPUT)
    expect(e.value.status).toBe("SYNCING")
    expect(e.value.userId).toBe("user-1")
    expect(e.value.provider).toBe("belvo")
  })

  it("create exige campos obrigatórios", () => {
    expect(() => BankConnectionEntity.create({ ...VALID_INPUT, userId: "" })).toThrow(/Usuario/)
    expect(() => BankConnectionEntity.create({ ...VALID_INPUT, provider: "" })).toThrow(/Provider/)
    expect(() => BankConnectionEntity.create({ ...VALID_INPUT, providerLinkId: "" })).toThrow(/Link id/)
    expect(() => BankConnectionEntity.create({ ...VALID_INPUT, institutionCode: "" })).toThrow(/instituicao/)
    expect(() => BankConnectionEntity.create({ ...VALID_INPUT, institutionName: "" })).toThrow(/Nome/)
  })

  it("permite SYNCING -> ACTIVE", () => {
    const e = BankConnectionEntity.create(VALID_INPUT)
    const next = e.markActive()
    expect(next.status).toBe("ACTIVE")
    expect(next.lastSyncedAt).toBeInstanceOf(Date)
    expect(next.lastError).toBeNull()
  })

  it("permite ACTIVE -> ERROR com mensagem", () => {
    const e = BankConnectionEntity.fromRecord({ ...VALID_INPUT, status: "ACTIVE" })
    const next = e.markError("conexao recusada")
    expect(next.status).toBe("ERROR")
    expect(next.lastError).toBe("conexao recusada")
  })

  it("permite ACTIVE -> REVOKED", () => {
    const e = BankConnectionEntity.fromRecord({ ...VALID_INPUT, status: "ACTIVE" })
    const next = e.markRevoked()
    expect(next.status).toBe("REVOKED")
  })

  it("bloqueia transição inválida REVOKED -> ACTIVE", () => {
    const e = BankConnectionEntity.fromRecord({ ...VALID_INPUT, status: "REVOKED" })
    expect(() => e.markActive()).toThrow(/Transicao de status invalida/)
  })

  it("isConsentExpired retorna true quando expiresAt passou", () => {
    const past = new Date(Date.now() - 1000)
    const e = BankConnectionEntity.fromRecord({ ...VALID_INPUT, status: "ACTIVE", consentExpiresAt: past })
    expect(e.isConsentExpired()).toBe(true)
  })

  it("isConsentExpired retorna false quando consentExpiresAt é null", () => {
    const e = BankConnectionEntity.create(VALID_INPUT)
    expect(e.isConsentExpired()).toBe(false)
  })
})
