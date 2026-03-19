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

describe("use-budget (legacy compatibility)", () => {
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

  it("mantem compatibilidade minima para add-funds enquanto houver transicao", async () => {
    mockApiPost.mockResolvedValue({ ok: true })
    const hook = useBudget(3, 2026)

    await hook.addFunds("group_food", 250)

    expect(mockApiPost).toHaveBeenCalledWith("/budget/group_food/2026/3/add-funds", { amount: 250 })
    expect(mutateMock).toHaveBeenCalledTimes(1)
  })
})
