import { describe, expect, it } from "vitest"
import { ContactEntity } from "./contact-entity"

describe("ContactEntity", () => {
  it("cria contato valido com status padrao ACTIVE", () => {
    const entity = ContactEntity.create({
      userId: "user-1",
      name: "Fornecedor XPTO",
      type: "supplier",
    })

    expect(entity.value.userId).toBe("user-1")
    expect(entity.value.name).toBe("Fornecedor XPTO")
    expect(entity.value.type).toBe("SUPPLIER")
    expect(entity.value.status).toBe("ACTIVE")
  })

  it("monta payload de update com normalizacao", () => {
    const entity = ContactEntity.create({
      userId: "user-1",
      name: "Cliente A",
      type: "customer",
      status: "active",
    })

    const payload = entity.buildUpdatePayload({
      name: "Cliente A Prime",
      status: "inactive",
      email: "cliente@mmx.dev",
    })

    expect(payload.name).toBe("Cliente A Prime")
    expect(payload.status).toBe("INACTIVE")
    expect(payload.email).toBe("cliente@mmx.dev")
  })

  it("lanca erro em nome vazio", () => {
    expect(() =>
      ContactEntity.create({
        userId: "user-1",
        name: "",
        type: "customer",
      }),
    ).toThrow("Nome do contato e obrigatorio")
  })
})
