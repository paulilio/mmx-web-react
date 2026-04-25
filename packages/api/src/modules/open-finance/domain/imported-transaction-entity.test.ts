import { describe, expect, it } from "vitest"
import { ImportedTransactionEntity, descriptionSimilarity } from "./imported-transaction-entity"

const VALID_INPUT = {
  bankConnectionId: "bc-1",
  externalId: "tx-1",
  source: "TRANSACTION" as const,
  rawPayload: { id: "tx-1" },
  amount: -89.9,
  occurredAt: new Date("2026-04-15T00:00:00Z"),
  description: "Padaria do Bairro",
}

describe("ImportedTransactionEntity", () => {
  it("create produz entidade PENDING", () => {
    const e = ImportedTransactionEntity.create(VALID_INPUT)
    expect(e.value.status).toBe("PENDING")
    expect(e.value.currency).toBe("BRL")
    expect(e.value.matchedTransactionId).toBeNull()
  })

  it("create rejeita amount inválido e descrição vazia", () => {
    expect(() => ImportedTransactionEntity.create({ ...VALID_INPUT, amount: NaN })).toThrow(/numero/)
    expect(() => ImportedTransactionEntity.create({ ...VALID_INPUT, description: "" })).toThrow(/Descricao/)
  })

  it("markImported preserva status e matchedTransactionId", () => {
    const e = ImportedTransactionEntity.create(VALID_INPUT)
    const next = e.markImported("tx-mmx-1")
    expect(next.status).toBe("IMPORTED")
    expect(next.matchedTransactionId).toBe("tx-mmx-1")
  })

  it("matchesCandidate aceita amount, dia e descrição compatíveis", () => {
    const e = ImportedTransactionEntity.create(VALID_INPUT)
    expect(
      e.matchesCandidate({
        amount: -89.9,
        occurredAt: new Date("2026-04-15T18:00:00Z"),
        description: "PADARIA DO BAIRRO",
      }),
    ).toBe(true)
  })

  it("matchesCandidate rejeita amount fora da tolerância", () => {
    const e = ImportedTransactionEntity.create(VALID_INPUT)
    expect(
      e.matchesCandidate({
        amount: -90.5,
        occurredAt: new Date("2026-04-15T00:00:00Z"),
        description: "Padaria do Bairro",
      }),
    ).toBe(false)
  })

  it("matchesCandidate rejeita data fora da janela ±1d", () => {
    const e = ImportedTransactionEntity.create(VALID_INPUT)
    expect(
      e.matchesCandidate({
        amount: -89.9,
        occurredAt: new Date("2026-04-20T00:00:00Z"),
        description: "Padaria do Bairro",
      }),
    ).toBe(false)
  })

  it("matchesCandidate rejeita descrição muito diferente", () => {
    const e = ImportedTransactionEntity.create(VALID_INPUT)
    expect(
      e.matchesCandidate({
        amount: -89.9,
        occurredAt: new Date("2026-04-15T00:00:00Z"),
        description: "Restaurante Chez François",
      }),
    ).toBe(false)
  })

  it("descriptionSimilarity é 1 para strings normalizadas iguais", () => {
    expect(descriptionSimilarity("Padaria do BAIRRO", "padaria do bairro")).toBe(1)
  })

  it("descriptionSimilarity é 0 para strings vazias", () => {
    expect(descriptionSimilarity("", "qualquer")).toBe(0)
  })
})
