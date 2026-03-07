import { describe, expect, it } from "vitest"
import {
  mapCategory,
  parseCategoryStatus,
  parseCategoryType,
  resolveUserId,
} from "./categories-mapper"

describe("categories-mapper", () => {
  it("resolve userId com precedencia body > query > header", () => {
    const request = {
      nextUrl: new URL("http://localhost/api/categories?userId=query-user"),
      headers: new Headers({ "x-user-id": "header-user" }),
    }

    expect(resolveUserId(request as never, "body-user")).toBe("body-user")
    expect(resolveUserId(request as never)).toBe("query-user")

    const requestWithoutQuery = {
      nextUrl: new URL("http://localhost/api/categories"),
      headers: new Headers({ "x-user-id": "header-user" }),
    }

    expect(resolveUserId(requestWithoutQuery as never)).toBe("header-user")
    expect(
      resolveUserId(
        {
          nextUrl: new URL("http://localhost/api/categories"),
          headers: new Headers(),
        } as never,
      ),
    ).toBeNull()
  })

  it("parseCategoryType aceita valores validos", () => {
    expect(parseCategoryType("income")).toBe("INCOME")
    expect(parseCategoryType(" EXPENSE ")).toBe("EXPENSE")
    expect(parseCategoryType(undefined)).toBeUndefined()
  })

  it("parseCategoryStatus aceita valores validos", () => {
    expect(parseCategoryStatus("active")).toBe("ACTIVE")
    expect(parseCategoryStatus(" INACTIVE ")).toBe("INACTIVE")
    expect(parseCategoryStatus(null)).toBeUndefined()
  })

  it("parseCategoryType e parseCategoryStatus rejeitam valores invalidos", () => {
    expect(() => parseCategoryType("other")).toThrow("Tipo da categoria invalido")
    expect(() => parseCategoryStatus("archived")).toThrow("Status da categoria invalido")
    expect(() => parseCategoryType(123)).toThrow("Tipo da categoria invalido")
    expect(() => parseCategoryStatus({})).toThrow("Status da categoria invalido")
  })

  it("mapCategory converte campos para payload de cliente", () => {
    const mapped = mapCategory({
      id: "cat-1",
      userId: "user-1",
      name: "Salario",
      description: null,
      type: "INCOME",
      categoryGroupId: null,
      areaId: "area-1",
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T10:00:00.000Z"),
      updatedAt: new Date("2026-03-02T11:00:00.000Z"),
    })

    expect(mapped).toEqual({
      id: "cat-1",
      userId: "user-1",
      name: "Salario",
      description: null,
      type: "income",
      categoryGroupId: null,
      areaId: "area-1",
      status: "active",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-02T11:00:00.000Z",
    })
  })
})
