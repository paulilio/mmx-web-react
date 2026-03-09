import { beforeEach, describe, expect, it, vi } from "vitest"

const { reportServiceMock } = vi.hoisted(() => {
  return {
    reportServiceMock: {
      getSummary: vi.fn(),
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

describe("/api/reports/summary route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 401 quando autenticacao nao e informada", async () => {
    const response = await GET(makeRequest("http://localhost/api/reports/summary") as never)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("AUTH_REQUIRED")
  })

  it("GET retorna resumo quando autenticado", async () => {
    reportServiceMock.getSummary.mockResolvedValueOnce({
      totalOpen: 0,
      totalOverdue: 0,
      totalNext7Days: 0,
      totalNext30Days: 0,
      totalReceivables: 1000,
      totalPayables: 300,
      completedReceivables: 800,
      completedPayables: 200,
      pendingReceivables: 200,
      pendingPayables: 100,
    })

    const response = await GET(makeRequest("http://localhost/api/reports/summary?userId=user-1") as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(reportServiceMock.getSummary).toHaveBeenCalledWith("user-1")
    expect(payload.error).toBeNull()
    expect(payload.data.totalReceivables).toBe(1000)
  })

  it("GET retorna erro 400 quando service falha", async () => {
    reportServiceMock.getSummary.mockRejectedValueOnce(new Error("Falha interna"))

    const response = await GET(makeRequest("http://localhost/api/reports/summary?userId=user-1") as never)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("REPORT_SUMMARY_ERROR")
  })
})
