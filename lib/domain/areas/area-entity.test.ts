import { describe, expect, it } from "vitest"
import { AreaEntity } from "./area-entity"

describe("AreaEntity", () => {
  it("cria área válida com status padrão", () => {
    const entity = AreaEntity.create({
      userId: "user-1",
      name: "Moradia",
      type: "fixed-expenses",
      color: "#3b82f6",
      icon: "home",
    })

    expect(entity.value.userId).toBe("user-1")
    expect(entity.value.type).toBe("FIXED_EXPENSES")
    expect(entity.value.status).toBe("ACTIVE")
  })

  it("monta payload de update com normalização", () => {
    const entity = AreaEntity.create({
      userId: "user-1",
      name: "Renda",
      type: "income",
      color: "#10b981",
      icon: "dollar-sign",
    })

    const payload = entity.buildUpdatePayload({
      type: "daily-expenses",
      status: "inactive",
      color: "#f59e0b",
    })

    expect(payload.type).toBe("DAILY_EXPENSES")
    expect(payload.status).toBe("INACTIVE")
    expect(payload.color).toBe("#f59e0b")
  })

  it("falha quando nome obrigatório não é informado", () => {
    expect(() =>
      AreaEntity.create({
        userId: "user-1",
        name: "",
        type: "income",
        color: "#10b981",
        icon: "dollar-sign",
      }),
    ).toThrow("Nome da area e obrigatorio")
  })
})
