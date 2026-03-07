import { describe, expect, it } from "vitest"
import { hashPassword, verifyPassword } from "./password-hash"

describe("password-hash", () => {
  it("gera hash diferente da senha em texto puro", async () => {
    const plainPassword = "Senha@123"

    const passwordHash = await hashPassword(plainPassword)

    expect(passwordHash).not.toBe(plainPassword)
    expect(passwordHash.length).toBeGreaterThan(20)
  })

  it("retorna true para senha valida", async () => {
    const plainPassword = "Senha@123"
    const passwordHash = await hashPassword(plainPassword)

    const isValid = await verifyPassword(plainPassword, passwordHash)

    expect(isValid).toBe(true)
  })

  it("retorna false para senha invalida", async () => {
    const passwordHash = await hashPassword("Senha@123")

    const isValid = await verifyPassword("SenhaErrada@123", passwordHash)

    expect(isValid).toBe(false)
  })
})
