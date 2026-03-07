import { beforeEach, describe, expect, it, vi } from "vitest"
import useSWR from "swr"
import { api } from "@/lib/client/api"
import { useBudget } from "./use-budget"

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

describe("use-budget", () => {
  const mutateMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseSWR.mockReturnValue({
      data: [],
      error: undefined,
      mutate: mutateMock,
      isLoading: false,
      isValidating: false,
    } as unknown as ReturnType<typeof useSWR>)
  })

  it("chama endpoint de add-funds com ano/mes corretos e faz mutate", async () => {
    mockApiPost.mockResolvedValue({ ok: true })
    const hook = useBudget(3, 2026)

    await hook.addFunds("group_food", 250)

    expect(mockApiPost).toHaveBeenCalledWith("/budget/group_food/2026/3/add-funds", { amount: 250 })
    expect(mutateMock).toHaveBeenCalledTimes(1)
  })

  it("chama transfer-funds e faz mutate", async () => {
    mockApiPost.mockResolvedValue({ ok: true })
    const hook = useBudget(3, 2026)

    await hook.transferFunds({
      fromBudgetGroupId: "group_a",
      toBudgetGroupId: "group_b",
      amount: 100,
      month: 3,
      year: 2026,
    })

    expect(mockApiPost).toHaveBeenCalledWith("/budget/transfer-funds", {
      fromBudgetGroupId: "group_a",
      toBudgetGroupId: "group_b",
      amount: 100,
      month: 3,
      year: 2026,
    })
    expect(mutateMock).toHaveBeenCalledTimes(1)
  })

  it("configura rollover no endpoint correto e faz mutate", async () => {
    mockApiPut.mockResolvedValue({ ok: true })
    const hook = useBudget(3, 2026)

    await hook.configureRollover("group_food", true, 75)

    expect(mockApiPut).toHaveBeenCalledWith("/budget/group_food/2026/3/rollover", {
      rolloverEnabled: true,
      rolloverAmount: 75,
    })
    expect(mutateMock).toHaveBeenCalledTimes(1)
  })
})
