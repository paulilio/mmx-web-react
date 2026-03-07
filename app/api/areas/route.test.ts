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
  areaService: serviceMock,
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

describe("/api/areas route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 400 quando userId não é informado", async () => {
    const response = await GET(makeRequest({ url: "http://localhost/api/areas" }) as never)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("USER_ID_REQUIRED")
  })

  it("GET retorna lista paginada com mapper aplicado", async () => {
    serviceMock.list.mockResolvedValueOnce({
      data: [
        {
          id: "area-1",
          userId: "user-1",
          name: "Renda",
          description: null,
          type: "INCOME",
          color: "#10b981",
          icon: "dollar-sign",
          status: "ACTIVE",
          createdAt: new Date("2026-03-01T00:00:00.000Z"),
          updatedAt: new Date("2026-03-02T00:00:00.000Z"),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    })

    const response = await GET(makeRequest({ url: "http://localhost/api/areas?userId=user-1&type=income" }) as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.data[0].type).toBe("income")
  })

  it("POST cria área e retorna 201", async () => {
    serviceMock.create.mockResolvedValueOnce({
      id: "area-1",
      userId: "user-1",
      name: "Renda",
      description: null,
      type: "INCOME",
      color: "#10b981",
      icon: "dollar-sign",
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/areas",
        method: "POST",
        body: {
          userId: "user-1",
          name: "Renda",
          type: "income",
          color: "#10b981",
          icon: "dollar-sign",
        },
      }) as never,
    )

    expect(response.status).toBe(201)
  })
})
