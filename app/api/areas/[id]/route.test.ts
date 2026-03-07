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
  areaService: serviceMock,
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

describe("/api/areas/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 404 quando área não existe", async () => {
    serviceMock.getById.mockResolvedValueOnce(null)

    const response = await GET(
      makeRequest({ url: "http://localhost/api/areas/area-404?userId=user-1" }) as never,
      { params: { id: "area-404" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe("AREA_NOT_FOUND")
  })

  it("GET retorna área quando existe", async () => {
    serviceMock.getById.mockResolvedValueOnce({
      id: "area-1",
      userId: "user-1",
      name: "Renda",
      description: null,
      type: "INCOME",
      color: "#10b981",
      icon: "dollar-sign",
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    })

    const response = await GET(
      makeRequest({
        url: "http://localhost/api/areas/area-1",
        headers: { "x-user-id": "user-1" },
      }) as never,
      { params: { id: "area-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.type).toBe("income")
  })

  it("PUT retorna 404 quando service informa não encontrado", async () => {
    serviceMock.update.mockRejectedValueOnce(new Error("Area nao encontrada para este usuario"))

    const response = await PUT(
      makeRequest({
        url: "http://localhost/api/areas/area-404",
        method: "PUT",
        body: { userId: "user-1", name: "Novo nome" },
      }) as never,
      { params: { id: "area-404" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe("AREA_NOT_FOUND")
  })

  it("DELETE remove área e retorna payload mapeado", async () => {
    serviceMock.remove.mockResolvedValueOnce({
      id: "area-1",
      userId: "user-1",
      name: "Renda",
      description: null,
      type: "INCOME",
      color: "#10b981",
      icon: "dollar-sign",
      status: "INACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    const response = await DELETE(
      makeRequest({
        url: "http://localhost/api/areas/area-1?userId=user-1",
        method: "DELETE",
      }) as never,
      { params: { id: "area-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.status).toBe("inactive")
  })
})
