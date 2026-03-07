import { beforeEach, describe, expect, it, vi } from "vitest"
import useSWR from "swr"
import { api } from "@/lib/client/api"
import { useBudgetAllocations } from "./use-budget-allocations"

vi.mock("swr", () => ({
  default: vi.fn(),
}))

vi.mock("@/lib/client/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockUseSWR = vi.mocked(useSWR)
const mockApiPost = vi.mocked(api.post)
const mockApiPut = vi.mocked(api.put)
const mockApiDelete = vi.mocked(api.delete)

describe("use-budget-allocations", () => {
  const mutateMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseSWR.mockReturnValue({
      data: [
        {
          id: "alloc_1",
          budget_group_id: "group_a",
          month: "2026-03",
          planned_amount: 1000,
          funded_amount: 600,
          spent_amount: 100,
          available_amount: 500,
        },
        {
          id: "alloc_2",
          budget_group_id: "group_b",
          month: "2026-03",
          planned_amount: 500,
          funded_amount: 200,
          spent_amount: 20,
          available_amount: 180,
        },
      ],
      error: undefined,
      mutate: mutateMock,
      isLoading: false,
      isValidating: false,
    } as unknown as ReturnType<typeof useSWR>)
  })

  it("createBudgetAllocation injeta spent/available e chama mutate", async () => {
    mockApiPost.mockResolvedValue({ id: "alloc_3" })
    const hook = useBudgetAllocations("2026-03")

    await hook.createBudgetAllocation({
      budget_group_id: "group_c",
      month: "2026-03",
      planned_amount: 700,
      funded_amount: 300,
    })

    expect(mockApiPost).toHaveBeenCalledWith("/budget-allocations", {
      budget_group_id: "group_c",
      month: "2026-03",
      planned_amount: 700,
      funded_amount: 300,
      spent_amount: 0,
      available_amount: 300,
    })
    expect(mutateMock).toHaveBeenCalledTimes(1)
  })

  it("addFunds atualiza funded e available via update", async () => {
    mockApiPut.mockResolvedValue({ ok: true })
    const hook = useBudgetAllocations("2026-03")

    await hook.addFunds("alloc_1", 50)

    expect(mockApiPut).toHaveBeenCalledWith("/budget-allocations/alloc_1", {
      id: "alloc_1",
      budget_group_id: "group_a",
      month: "2026-03",
      planned_amount: 1000,
      funded_amount: 650,
      spent_amount: 100,
      available_amount: 550,
    })
    expect(mutateMock).toHaveBeenCalledTimes(1)
  })

  it("transferFunds atualiza origem e destino", async () => {
    mockApiPut.mockResolvedValue({ ok: true })
    const hook = useBudgetAllocations("2026-03")

    await hook.transferFunds("alloc_1", "alloc_2", 100)

    expect(mockApiPut).toHaveBeenCalledTimes(2)
    expect(mockApiPut).toHaveBeenCalledWith("/budget-allocations/alloc_1", {
      funded_amount: 500,
      available_amount: 400,
    })
    expect(mockApiPut).toHaveBeenCalledWith("/budget-allocations/alloc_2", {
      funded_amount: 300,
      available_amount: 280,
    })
  })

  it("transferFunds falha com saldo insuficiente", async () => {
    const hook = useBudgetAllocations("2026-03")

    await expect(hook.transferFunds("alloc_1", "alloc_2", 900)).rejects.toThrow("Insufficient funds")
    expect(mockApiPut).not.toHaveBeenCalled()
  })

  it("deleteBudgetAllocation chama delete e mutate", async () => {
    mockApiDelete.mockResolvedValue({})
    const hook = useBudgetAllocations("2026-03")

    await hook.deleteBudgetAllocation("alloc_2")

    expect(mockApiDelete).toHaveBeenCalledWith("/budget-allocations/alloc_2")
    expect(mutateMock).toHaveBeenCalledTimes(1)
  })
})
