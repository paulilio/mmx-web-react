import { beforeEach, describe, expect, it, vi } from "vitest"

const { reportServiceMock } = vi.hoisted(() => {
  return {
    reportServiceMock: {
      getSummary: vi.fn(),
      getAging: vi.fn(),
      getCashflow: vi.fn(),
    },
  }
})

vi.mock("@/lib/server/repositories", () => ({
  transactionRepository: {},
}))

vi.mock("@/lib/server/services/report-service", () => ({
  ReportService: vi.fn(
    class {
      constructor() {
        return reportServiceMock
      }
    },
  ),
}))

import { GET } from "./route"

function makeRequest(url: string) {
  return {
    nextUrl: new URL(url),
    headers: new Headers(),
  }
}

describe("/api/reports/cashflow route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 401 quando autenticacao nao e informada", async () => {
    const response = await GET(makeRequest("http://localhost/api/reports/cashflow") as never)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("AUTH_REQUIRED")
  })

  it("GET retorna 400 para status invalido", async () => {
    const response = await GET(makeRequest("http://localhost/api/reports/cashflow?userId=user-1&status=foo") as never)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("INVALID_INPUT")
  })

  it("GET retorna cashflow e repassa filtros", async () => {
    reportServiceMock.getCashflow.mockResolvedValueOnce([
      {
        date: "2026-03-01",
        income: 100,
        expense: 40,
        balance: 60,
        completedIncome: 80,
        completedExpense: 20,
        completedBalance: 60,
        pendingIncome: 20,
        pendingExpense: 20,
        pendingBalance: 0,
      },
    ])

    const response = await GET(
      makeRequest("http://localhost/api/reports/cashflow?userId=user-1&days=15&status=pending") as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(reportServiceMock.getCashflow).toHaveBeenCalledWith("user-1", {
      days: 15,
      status: "pending",
    })
    expect(payload.error).toBeNull()
    expect(payload.data[0].date).toBe("2026-03-01")
  })

  it("GET retorna erro 400 quando service falha", async () => {
    reportServiceMock.getCashflow.mockRejectedValueOnce(new Error("Falha interna"))

    const response = await GET(makeRequest("http://localhost/api/reports/cashflow?userId=user-1") as never)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("REPORT_CASHFLOW_ERROR")
  })
})
