import { describe, expect, it } from "vitest"
import {
  consumeTimedValue,
  findLatestActiveValue,
  generateConfirmationCode,
  generateResetToken,
  type TimedTokenRecord,
} from "./mock-auth-flow"

describe("mock-auth-flow", () => {
  it("gera codigo de confirmacao no formato esperado", () => {
    const code = generateConfirmationCode()
    expect(code).toMatch(/^XPX-[A-Z0-9]{4}$/)
  })

  it("gera token de reset no formato esperado", () => {
    const token = generateResetToken()
    expect(token).toMatch(/^RST-[A-Z0-9]{6}$/)
  })

  it("retorna o valor ativo mais recente por email", () => {
    const now = new Date("2026-03-07T12:00:00.000Z")
    const records: TimedTokenRecord[] = [
      {
        email: "ana@mmx.com",
        code: "XPX-AAAA",
        expiresAt: "2026-03-07T14:00:00.000Z",
        used: false,
        createdAt: "2026-03-07T10:00:00.000Z",
      },
      {
        email: "ana@mmx.com",
        code: "XPX-BBBB",
        expiresAt: "2026-03-07T14:00:00.000Z",
        used: false,
        createdAt: "2026-03-07T11:00:00.000Z",
      },
    ]

    const latest = findLatestActiveValue(records, "ana@mmx.com", "code", now)
    expect(latest).toBe("XPX-BBBB")
  })

  it("consome token valido e marca como usado", () => {
    const now = new Date("2026-03-07T12:00:00.000Z")
    const records: TimedTokenRecord[] = [
      {
        email: "ana@mmx.com",
        token: "RST-ABC123",
        expiresAt: "2026-03-07T14:00:00.000Z",
        used: false,
      },
    ]

    const result = consumeTimedValue(records, "ana@mmx.com", "RST-ABC123", "token", now)
    expect(result.valid).toBe(true)
    expect(result.updatedRecords[0]?.used).toBe(true)
  })

  it("nao consome token invalido ou expirado", () => {
    const now = new Date("2026-03-07T12:00:00.000Z")
    const records: TimedTokenRecord[] = [
      {
        email: "ana@mmx.com",
        token: "RST-ABC123",
        expiresAt: "2026-03-07T11:00:00.000Z",
        used: false,
      },
    ]

    const result = consumeTimedValue(records, "ana@mmx.com", "RST-ABC123", "token", now)
    expect(result.valid).toBe(false)
    expect(result.updatedRecords[0]?.used).toBe(false)
  })
})
