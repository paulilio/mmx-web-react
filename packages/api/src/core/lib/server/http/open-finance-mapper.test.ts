import { describe, expect, it } from "vitest"
import { mapConnection, mapImportedTransaction } from "./open-finance-mapper"

describe("open-finance-mapper", () => {
  it("mapConnection converte enums e datas pro contrato cliente", () => {
    const out = mapConnection({
      id: "bc-1",
      institutionCode: "ofmockbank_br_retail",
      institutionName: "OF Mock Bank",
      status: "ACTIVE",
      consentExpiresAt: new Date("2027-04-25T00:00:00Z"),
      lastSyncedAt: new Date("2026-04-25T12:00:00Z"),
      transactionCount: 142,
    })
    expect(out.status).toBe("active")
    expect(out.consentExpiresAt).toBe("2027-04-25T00:00:00.000Z")
    expect(out.lastSyncedAt).toBe("2026-04-25T12:00:00.000Z")
    expect(out.transactionCount).toBe(142)
  })

  it("mapConnection serializa nulls em datas", () => {
    const out = mapConnection({
      id: "bc-1",
      institutionCode: "x",
      institutionName: "x",
      status: "SYNCING",
      consentExpiresAt: null,
      lastSyncedAt: null,
      transactionCount: 0,
    })
    expect(out.consentExpiresAt).toBeNull()
    expect(out.lastSyncedAt).toBeNull()
    expect(out.status).toBe("syncing")
  })

  it("mapImportedTransaction normaliza enums e source", () => {
    const out = mapImportedTransaction({
      id: "imp-1",
      bankConnectionId: "bc-1",
      externalId: "tx-1",
      source: "BILL",
      rawPayload: {},
      amount: -123.45,
      currency: "BRL",
      occurredAt: new Date("2026-04-15"),
      description: "Compra",
      merchantName: null,
      categoryHint: null,
      status: "PENDING",
      matchedTransactionId: null,
    })
    expect(out.status).toBe("pending")
    expect(out.source).toBe("bill")
    expect(out.amount).toBe(-123.45)
    expect(out.matchedTransactionId).toBeNull()
  })
})
