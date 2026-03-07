import { describe, expect, it } from "vitest"
import { CategoryEntity } from "./category-entity"

describe("CategoryEntity", () => {
  it("cria categoria valida com status padrao ACTIVE", () => {
    const entity = CategoryEntity.create({
      userId: "user-1",
      name: "Supermercado",
      type: "expense",
    })

    expect(entity.value.userId).toBe("user-1")
    expect(entity.value.name).toBe("Supermercado")
    expect(entity.value.type).toBe("EXPENSE")
    expect(entity.value.status).toBe("ACTIVE")
  })

  it("monta payload de update com normalizacao", () => {
    const entity = CategoryEntity.create({
      userId: "user-1",
      name: "Salario",
      type: "income",
      status: "active",
    })

    const payload = entity.buildUpdatePayload({
      name: "Salario Principal",
      type: "income",
      status: "inactive",
    })

    expect(payload.name).toBe("Salario Principal")
    expect(payload.type).toBe("INCOME")
    expect(payload.status).toBe("INACTIVE")
  })

  it("lanca erro quando nome e invalido", () => {
    expect(() =>
      CategoryEntity.create({
        userId: "user-1",
        name: "",
        type: "income",
      }),
    ).toThrow("Nome da categoria e obrigatorio")
  })
})
