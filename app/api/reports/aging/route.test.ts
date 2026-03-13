import { beforeEach, describe, expect, it, vi } from "vitest"

const { reportServiceMock } = vi.hoisted(() => {
  return {
    reportServiceMock: {
      getSummary: vi.fn(),
      getAging: vi.fn(),
    },
  }
})

vi.mock("@/lib/server/services", () => ({
  reportService: reportServiceMock,
}))

import { GET } from "./route"

function makeRequest(url: string) {
  return {
    nextUrl: new URL(url),
    headers: new Headers(),
  }
}

describe("/api/reports/aging route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 401 quando autenticacao nao e informada", async () => {
    const response = await GET(makeRequest("http://localhost/api/reports/aging") as never)
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("AUTH_REQUIRED")
  })

  it("GET retorna aging e repassa filtros de periodo", async () => {
    reportServiceMock.getAging.mockResolvedValueOnce({
      overdue: 10,
      next7Days: 20,
      next30Days: 30,
      future: 40,
      completedOverdue: 1,
      completedNext7Days: 2,
      completedNext30Days: 3,
      pendingOverdue: 9,
      pendingNext7Days: 18,
      pendingNext30Days: 27,
    })

    const response = await GET(
      makeRequest("http://localhost/api/reports/aging?userId=user-1&dateFrom=2026-03-01&dateTo=2026-03-31") as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(reportServiceMock.getAging).toHaveBeenCalledWith("user-1", {
      dateFrom: "2026-03-01",
      dateTo: "2026-03-31",
    })
    expect(payload.error).toBeNull()
    expect(payload.data.overdue).toBe(10)
  })

  it("GET retorna erro 400 quando service falha", async () => {
    reportServiceMock.getAging.mockRejectedValueOnce(new Error("Intervalo de datas invalido"))

    const response = await GET(makeRequest("http://localhost/api/reports/aging?userId=user-1") as never)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("REPORT_AGING_ERROR")
  })
})
