import { beforeEach, describe, expect, it, vi } from "vitest"
import useSWR from "swr"
import { getJSON } from "@/lib/client/api"
import {
  useAgingReport,
  useCashflowByStatus,
  useCashflowData,
  useDashboardSummary,
  useStatusSummary,
} from "./use-dashboard-data"

vi.mock("swr", () => ({
  default: vi.fn(),
}))

vi.mock("@/lib/client/api", () => ({
  getJSON: vi.fn(),
}))

const mockUseSWR = vi.mocked(useSWR)

describe("use-dashboard-data", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("useDashboardSummary usa endpoint e fetcher esperados", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useSWR>)

    useDashboardSummary()

    expect(mockUseSWR).toHaveBeenCalledWith("/reports/summary", getJSON)
  })

  it("useAgingReport usa endpoint e fetcher esperados", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useSWR>)

    useAgingReport()

    expect(mockUseSWR).toHaveBeenCalledWith("/reports/aging", getJSON)
  })

  it("useCashflowData monta endpoint com status quando filtro e informado", () => {
    mockUseSWR.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useSWR>)

    useCashflowData(15, "pending")

    expect(mockUseSWR).toHaveBeenCalledWith("/reports/cashflow?days=15&status=pending", getJSON)
  })

  it("useCashflowData omite status quando filtro e all", () => {
    mockUseSWR.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useSWR>)

    useCashflowData(30, "all")

    expect(mockUseSWR).toHaveBeenCalledWith("/reports/cashflow?days=30", getJSON)
  })

  it("useStatusSummary retorna zeros quando resumo ainda nao carregou", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useSWR>)

    const result = useStatusSummary()

    expect(result).toEqual({
      completedReceivables: 0,
      completedPayables: 0,
      pendingReceivables: 0,
      pendingPayables: 0,
    })
  })

  it("useCashflowByStatus agrega retornos de completed/pending/all", () => {
    mockUseSWR
      .mockReturnValueOnce({
        data: [{ date: "2026-03-01" }],
        error: undefined,
        isLoading: false,
      } as unknown as ReturnType<typeof useSWR>)
      .mockReturnValueOnce({
        data: [{ date: "2026-03-02" }],
        error: undefined,
        isLoading: true,
      } as unknown as ReturnType<typeof useSWR>)
      .mockReturnValueOnce({
        data: [{ date: "2026-03-03" }],
        error: undefined,
        isLoading: false,
      } as unknown as ReturnType<typeof useSWR>)

    const result = useCashflowByStatus(10)

    expect(result.completed).toEqual([{ date: "2026-03-01" }])
    expect(result.pending).toEqual([{ date: "2026-03-02" }])
    expect(result.all).toEqual([{ date: "2026-03-03" }])
    expect(result.isLoading).toBe(true)
    expect(result.error).toBeUndefined()

    expect(mockUseSWR).toHaveBeenNthCalledWith(1, "/reports/cashflow?days=10&status=completed", getJSON)
    expect(mockUseSWR).toHaveBeenNthCalledWith(2, "/reports/cashflow?days=10&status=pending", getJSON)
    expect(mockUseSWR).toHaveBeenNthCalledWith(3, "/reports/cashflow?days=10", getJSON)
  })
})
