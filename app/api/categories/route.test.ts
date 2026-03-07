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

vi.mock("../../../lib/server/services", () => ({
  categoryService: serviceMock,
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

describe("/api/categories route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 401 quando autenticacao nao e informada", async () => {
    const response = await GET(makeRequest({ url: "http://localhost/api/categories" }) as never)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.data).toBeNull()
    expect(payload.error.code).toBe("AUTH_REQUIRED")
  })

  it("GET retorna lista paginada com mapper aplicado", async () => {
    serviceMock.list.mockResolvedValueOnce({
      data: [
        {
          id: "cat-1",
          userId: "user-1",
          name: "Salario",
          description: null,
          type: "INCOME",
          categoryGroupId: null,
          areaId: null,
          status: "ACTIVE",
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
        url: "http://localhost/api/categories?userId=user-1&type=income&status=active&page=1&pageSize=20",
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(serviceMock.list).toHaveBeenCalledWith(
      {
        userId: "user-1",
        type: "INCOME",
        status: "ACTIVE",
        categoryGroupId: undefined,
        areaId: undefined,
      },
      {
        page: 1,
        pageSize: 20,
      },
    )
    expect(payload.error).toBeNull()
    expect(payload.data.total).toBe(1)
    expect(payload.data.data[0].type).toBe("income")
    expect(payload.data.data[0].status).toBe("active")
  })

  it("GET retorna erro 400 para filtro invalido", async () => {
    const response = await GET(
      makeRequest({ url: "http://localhost/api/categories?userId=user-1&type=other" }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("CATEGORY_LIST_ERROR")
    expect(payload.error.message).toBe("Tipo da categoria invalido")
  })

  it("POST retorna 400 quando campos obrigatorios faltam", async () => {
    const response = await POST(
      makeRequest({
        url: "http://localhost/api/categories",
        method: "POST",
        body: { userId: "user-1" },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("INVALID_INPUT")
  })

  it("POST cria categoria e retorna status 201", async () => {
    serviceMock.create.mockResolvedValueOnce({
      id: "cat-1",
      userId: "user-1",
      name: "Salario",
      description: null,
      type: "INCOME",
      categoryGroupId: null,
      areaId: null,
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/categories",
        method: "POST",
        body: {
          userId: "user-1",
          name: "Salario",
          type: "income",
          status: "active",
        },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(serviceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        name: "Salario",
        type: "income",
      }),
    )
    expect(payload.error).toBeNull()
    expect(payload.data.type).toBe("income")
  })
})
