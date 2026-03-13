import { beforeEach, describe, expect, it, vi } from "vitest"

const { serviceMock } = vi.hoisted(() => {
  return {
    serviceMock: {
      list: vi.fn(),
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
  }
})

vi.mock("@/lib/server/services", () => ({
  categoryGroupService: serviceMock,
}))

import { DELETE, GET, PUT } from "./route"

function makeRequest(options: {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: unknown
}) {
  const { url, method = "GET", headers, body } = options

  return {
    nextUrl: new URL(url),
    headers: new Headers(headers),
    json: async () => body,
    method,
  }
}

describe("/api/category-groups/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 404 quando grupo nao existe", async () => {
    serviceMock.getById.mockResolvedValueOnce(null)

    const response = await GET(
      makeRequest({ url: "http://localhost/api/category-groups/cg-404?userId=user-1" }) as never,
      { params: { id: "cg-404" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe("CATEGORY_GROUP_NOT_FOUND")
  })

  it("GET retorna payload mapeado quando existe", async () => {
    serviceMock.getById.mockResolvedValueOnce({
      id: "cg-1",
      userId: "user-1",
      name: "Fixas",
      description: null,
      color: "#3b82f6",
      icon: "home",
      status: "ACTIVE",
      areaId: null,
      categoryIds: ["cat-1"],
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    const response = await GET(
      makeRequest({ url: "http://localhost/api/category-groups/cg-1?userId=user-1" }) as never,
      { params: { id: "cg-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.status).toBe("active")
  })

  it("PUT retorna 401 sem autenticacao", async () => {
    const response = await PUT(
      makeRequest({
        url: "http://localhost/api/category-groups/cg-1",
        method: "PUT",
        body: { name: "Novo nome" },
      }) as never,
      { params: { id: "cg-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("AUTH_REQUIRED")
  })

  it("PUT retorna 404 quando grupo nao e encontrado", async () => {
    serviceMock.update.mockRejectedValueOnce(new Error("Grupo de categoria nao encontrado para este usuario"))

    const response = await PUT(
      makeRequest({
        url: "http://localhost/api/category-groups/cg-404",
        method: "PUT",
        body: { userId: "user-1", name: "Novo nome" },
      }) as never,
      { params: { id: "cg-404" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe("CATEGORY_GROUP_NOT_FOUND")
  })

  it("PUT retorna 400 quando status informado e invalido", async () => {
    const response = await PUT(
      makeRequest({
        url: "http://localhost/api/category-groups/cg-1",
        method: "PUT",
        body: { userId: "user-1", status: "foo" },
      }) as never,
      { params: { id: "cg-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("CATEGORY_GROUP_UPDATE_ERROR")
  })

  it("DELETE remove grupo e retorna payload mapeado", async () => {
    serviceMock.remove.mockResolvedValueOnce({
      id: "cg-1",
      userId: "user-1",
      name: "Fixas",
      description: null,
      color: "#3b82f6",
      icon: "home",
      status: "INACTIVE",
      areaId: null,
      categoryIds: [],
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    const response = await DELETE(
      makeRequest({
        url: "http://localhost/api/category-groups/cg-1?userId=user-1",
        method: "DELETE",
      }) as never,
      { params: { id: "cg-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(serviceMock.remove).toHaveBeenCalledWith("cg-1", "user-1")
    expect(payload.data.status).toBe("inactive")
  })

  it("DELETE retorna erro interno quando service falha", async () => {
    serviceMock.remove.mockRejectedValueOnce(new Error("Falha ao excluir"))

    const response = await DELETE(
      makeRequest({
        url: "http://localhost/api/category-groups/cg-1?userId=user-1",
        method: "DELETE",
      }) as never,
      { params: { id: "cg-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("CATEGORY_GROUP_DELETE_ERROR")
  })
})
