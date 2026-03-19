import { describe, expect, it } from "vitest"
import {
  mapCategoryGroup,
  parseCategoryGroupStatus,
} from "./category-groups-mapper"

describe("category-groups-mapper", () => {
  it("parseCategoryGroupStatus aceita valores validos", () => {
    expect(parseCategoryGroupStatus("active")).toBe("ACTIVE")
    expect(parseCategoryGroupStatus(" INACTIVE ")).toBe("INACTIVE")
    expect(parseCategoryGroupStatus(undefined)).toBeUndefined()
  })

  it("parseCategoryGroupStatus rejeita valores invalidos", () => {
    expect(() => parseCategoryGroupStatus("archived")).toThrow("Status do grupo invalido")
    expect(() => parseCategoryGroupStatus(10)).toThrow("Status do grupo invalido")
  })

  it("mapCategoryGroup converte payload para contrato de cliente", () => {
    const mapped = mapCategoryGroup({
      id: "cg-1",
      userId: "user-1",
      name: "Fixas",
      description: "Despesas fixas",
      color: "#3b82f6",
      icon: "home",
      status: "ACTIVE",
      areaId: "area-1",
      categoryIds: ["cat-1", "cat-2"],
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    expect(mapped).toEqual({
      id: "cg-1",
      userId: "user-1",
      name: "Fixas",
      description: "Despesas fixas",
      color: "#3b82f6",
      icon: "home",
      status: "active",
      areaId: "area-1",
      categoryIds: ["cat-1", "cat-2"],
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-02T00:00:00.000Z",
    })
  })

  it("mapCategoryGroup retorna categoryIds vazio quando ausente", () => {
    const mapped = mapCategoryGroup({
      id: "cg-2",
      userId: "user-1",
      name: "Variaveis",
      description: null,
      color: "#10b981",
      icon: "wallet",
      status: "INACTIVE",
      areaId: null,
      createdAt: new Date("2026-03-03T00:00:00.000Z"),
      updatedAt: new Date("2026-03-04T00:00:00.000Z"),
    })

    expect(mapped.categoryIds).toEqual([])
    expect(mapped.status).toBe("inactive")
  })
})
