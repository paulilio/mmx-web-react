import { beforeEach, describe, expect, it, vi } from "vitest"

const { serviceMock } = vi.hoisted(() => {
  return {
    serviceMock: {
      listAllocations: vi.fn(),
      createAllocation: vi.fn(),
    },
  }
})

vi.mock("../../../lib/server/services", () => ({
  budgetService: serviceMock,
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

describe("/api/budget-allocations route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 401 sem autenticacao", async () => {
    const response = await GET(makeRequest({ url: "http://localhost/api/budget-allocations" }) as never)
    expect(response.status).toBe(401)
  })

  it("GET retorna lista paginada", async () => {
    serviceMock.listAllocations.mockResolvedValueOnce({
      data: [
        {
          id: "alloc-1",
          userId: "user-1",
          budgetGroupId: "group-1",
          month: "2026-03",
          plannedAmount: "100",
          fundedAmount: "100",
          spentAmount: "20",
          availableAmount: "80",
          createdAt: new Date("2026-03-01T00:00:00.000Z"),
          updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    })

    const response = await GET(makeRequest({ url: "http://localhost/api/budget-allocations?userId=user-1" }) as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.data[0].planned_amount).toBe(100)
  })

  it("POST cria alocação", async () => {
    serviceMock.createAllocation.mockResolvedValueOnce({
      id: "alloc-1",
      userId: "user-1",
      budgetGroupId: "group-1",
      month: "2026-03",
      plannedAmount: "100",
      fundedAmount: "100",
      spentAmount: "0",
      availableAmount: "100",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    })

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/budget-allocations",
        method: "POST",
        body: { userId: "user-1", budgetGroupId: "group-1", month: "2026-03", plannedAmount: 100, fundedAmount: 100 },
      }) as never,
    )

    expect(response.status).toBe(201)
  })
})
