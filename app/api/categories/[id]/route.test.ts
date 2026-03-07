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

vi.mock("../../../../lib/server/services", () => ({
  categoryService: serviceMock,
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

describe("/api/categories/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 404 quando categoria nao existe", async () => {
    serviceMock.getById.mockResolvedValueOnce(null)

    const response = await GET(
      makeRequest({ url: "http://localhost/api/categories/cat-404?userId=user-1" }) as never,
      { params: { id: "cat-404" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe("CATEGORY_NOT_FOUND")
  })

  it("GET retorna categoria mapeada quando existe", async () => {
    serviceMock.getById.mockResolvedValueOnce({
      id: "cat-1",
      userId: "user-1",
      name: "Lazer",
      description: null,
      type: "EXPENSE",
      categoryGroupId: null,
      areaId: null,
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    })

    const response = await GET(
      makeRequest({
        url: "http://localhost/api/categories/cat-1",
        headers: { "x-user-id": "user-1" },
      }) as never,
      { params: { id: "cat-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.type).toBe("expense")
    expect(payload.data.status).toBe("active")
  })

  it("PUT retorna 400 quando userId nao e informado", async () => {
    const response = await PUT(
      makeRequest({
        url: "http://localhost/api/categories/cat-1",
        method: "PUT",
        body: { name: "Novo nome" },
      }) as never,
      { params: { id: "cat-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("USER_ID_REQUIRED")
  })

  it("PUT retorna 404 quando service informa nao encontrada", async () => {
    serviceMock.update.mockRejectedValueOnce(new Error("Categoria nao encontrada para este usuario"))

    const response = await PUT(
      makeRequest({
        url: "http://localhost/api/categories/cat-404",
        method: "PUT",
        body: { userId: "user-1", name: "Novo nome" },
      }) as never,
      { params: { id: "cat-404" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe("CATEGORY_NOT_FOUND")
  })

  it("DELETE remove categoria e retorna payload mapeado", async () => {
    serviceMock.remove.mockResolvedValueOnce({
      id: "cat-1",
      userId: "user-1",
      name: "Lazer",
      description: null,
      type: "EXPENSE",
      categoryGroupId: null,
      areaId: null,
      status: "INACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    const response = await DELETE(
      makeRequest({
        url: "http://localhost/api/categories/cat-1?userId=user-1",
        method: "DELETE",
      }) as never,
      { params: { id: "cat-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(serviceMock.remove).toHaveBeenCalledWith("cat-1", "user-1")
    expect(payload.data.status).toBe("inactive")
  })
})
