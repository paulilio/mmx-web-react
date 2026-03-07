import { describe, expect, it } from "vitest"
import {
  ensureEmailAvailable,
  normalizeEmail,
  validateLoginInput,
  validateRegisterInput,
} from "./auth-rules"

describe("auth-rules", () => {
  it("normaliza email para lowercase e sem espacos", () => {
    expect(normalizeEmail("  User@Email.COM  ")).toBe("user@email.com")
  })

  it("valida payload de registro com dados validos", () => {
    expect(() =>
      validateRegisterInput({
        email: "user@email.com",
        password: "Senha@123",
        firstName: "User",
        lastName: "Name",
      }),
    ).not.toThrow()
  })

  it("falha registro com senha curta", () => {
    expect(() =>
      validateRegisterInput({
        email: "user@email.com",
        password: "123",
        firstName: "User",
        lastName: "Name",
      }),
    ).toThrow("Senha deve ter no minimo 8 caracteres")
  })

  it("falha login com email invalido", () => {
    expect(() =>
      validateLoginInput({
        email: "email-invalido",
        password: "Senha@123",
      }),
    ).toThrow("Email invalido")
  })

  it("falha quando email ja existe", () => {
    expect(() => ensureEmailAvailable({ id: "u1" })).toThrow("Email ja esta em uso")
  })
})
