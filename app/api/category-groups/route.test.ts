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

vi.mock("../../../lib/server/services/category-group-service", () => ({
  CategoryGroupService: vi.fn(
    class {
      constructor() {
        return serviceMock
      }
    },
  ),
}))

vi.mock("../../../lib/server/repositories/category-group-repository", () => ({
  CategoryGroupRepository: vi.fn(),
}))

import { GET, POST } from "./route"

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

describe("/api/category-groups route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 401 quando autenticacao nao e informada", async () => {
    const response = await GET(makeRequest({ url: "http://localhost/api/category-groups" }) as never)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("AUTH_REQUIRED")
  })

  it("GET retorna lista paginada com mapper aplicado", async () => {
    serviceMock.list.mockResolvedValueOnce({
      data: [
        {
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
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    })

    const response = await GET(
      makeRequest({
        url: "http://localhost/api/category-groups?userId=user-1&status=active&page=1&pageSize=20",
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(serviceMock.list).toHaveBeenCalledWith(
      {
        userId: "user-1",
        status: "ACTIVE",
        areaId: undefined,
        name: undefined,
      },
      { page: 1, pageSize: 20 },
    )
    expect(payload.error).toBeNull()
    expect(payload.data.data[0].status).toBe("active")
  })

  it("POST retorna 400 quando campos obrigatorios faltam", async () => {
    const response = await POST(
      makeRequest({
        url: "http://localhost/api/category-groups",
        method: "POST",
        body: { userId: "user-1", name: "Grupo" },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("INVALID_INPUT")
  })

  it("POST cria grupo e retorna 201", async () => {
    serviceMock.create.mockResolvedValueOnce({
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

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/category-groups",
        method: "POST",
        body: {
          userId: "user-1",
          name: "Fixas",
          color: "#3b82f6",
          icon: "home",
          status: "active",
          categoryIds: ["cat-1"],
        },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(serviceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        status: "ACTIVE",
      }),
    )
    expect(payload.error).toBeNull()
    expect(payload.data.status).toBe("active")
  })
})
