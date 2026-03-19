import { beforeEach, describe, expect, it, vi } from "vitest"
import useSWR from "swr"
import { api } from "@/lib/client/api"
import { useTransactions } from "./use-transactions"
import type { Transaction, TransactionRecurrence } from "@/lib/shared/types"

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
const mockApiGet = vi.mocked(api.get)
const mockApiPut = vi.mocked(api.put)
const mockApiDelete = vi.mocked(api.delete)

const baseRecurrence: TransactionRecurrence = {
  enabled: true,
  frequency: "monthly",
  interval: 1,
}

function makeTransaction(overrides: Partial<Transaction>): Transaction {
  const id = overrides.id ?? "tx_1"
  return {
    id,
    description: "Conta",
    amount: 100,
    type: "expense",
    categoryId: "cat_1",
    date: "2026-03-01",
    status: "pending",
    recurrence: baseRecurrence,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
    ...overrides,
  }
}

describe("use-transactions recurrence flows", () => {
  const mutateMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mutateMock.mockReset()

    mockUseSWR.mockReturnValue({
      data: [],
      error: undefined,
      mutate: mutateMock,
      isLoading: false,
      isValidating: false,
    } as unknown as ReturnType<typeof useSWR>)
  })

  it("propaga alteracoes para toda a serie com applyMode=all", async () => {
    const series = [
      makeTransaction({ id: "tx_parent", date: "2026-03-01" }),
      makeTransaction({
        id: "tx_r1",
        date: "2026-04-01",
        recurrence: { ...baseRecurrence, enabled: false, generatedFrom: "tx_parent" },
      }),
      makeTransaction({
        id: "tx_r2",
        date: "2026-05-01",
        recurrence: { ...baseRecurrence, enabled: false, generatedFrom: "tx_parent" },
      }),
    ]

    mockApiGet.mockResolvedValue(series)
    mockApiPut.mockResolvedValue(makeTransaction({ id: "tx_parent" }))

    const hook = useTransactions()

    await hook.updateTransaction("tx_r1", {
      amount: 245,
      description: "Conta ajustada",
      recurrence: {
        ...baseRecurrence,
        enabled: false,
        generatedFrom: "tx_parent",
        applyMode: "all",
      },
    })

    expect(mockApiPut).toHaveBeenCalledTimes(3)
    expect(mockApiPut).toHaveBeenNthCalledWith(
      1,
      "/transactions/tx_parent",
      expect.objectContaining({
        id: "tx_parent",
        amount: 245,
        description: "Conta ajustada",
      }),
    )
    expect(mockApiPut).toHaveBeenNthCalledWith(
      2,
      "/transactions/tx_r1",
      expect.objectContaining({
        id: "tx_r1",
        amount: 245,
        description: "Conta ajustada",
      }),
    )
    expect(mockApiPut).toHaveBeenNthCalledWith(
      3,
      "/transactions/tx_r2",
      expect.objectContaining({
        id: "tx_r2",
        amount: 245,
        description: "Conta ajustada",
      }),
    )
  })

  it("propaga alteracoes apenas para atuais e futuras com applyMode=future", async () => {
    const series = [
      makeTransaction({ id: "tx_parent", date: "2026-03-01" }),
      makeTransaction({
        id: "tx_r1",
        date: "2026-04-01",
        recurrence: { ...baseRecurrence, enabled: false, generatedFrom: "tx_parent" },
      }),
      makeTransaction({
        id: "tx_r2",
        date: "2026-05-01",
        recurrence: { ...baseRecurrence, enabled: false, generatedFrom: "tx_parent" },
      }),
    ]

    mockApiGet.mockResolvedValue(series)
    mockApiPut.mockResolvedValue(makeTransaction({ id: "tx_r1", status: "completed" }))

    const hook = useTransactions()

    await hook.updateTransaction("tx_r1", {
      status: "completed",
      recurrence: {
        ...baseRecurrence,
        enabled: false,
        generatedFrom: "tx_parent",
        applyMode: "future",
      },
    })

    expect(mockApiPut).toHaveBeenCalledTimes(2)
    expect(mockApiPut).toHaveBeenCalledWith(
      "/transactions/tx_r1",
      expect.objectContaining({ id: "tx_r1", status: "completed" }),
    )
    expect(mockApiPut).toHaveBeenCalledWith(
      "/transactions/tx_r2",
      expect.objectContaining({ id: "tx_r2", status: "completed" }),
    )
  })

  it("remove eventos atuais e futuros em deleteRecurrence(followingEvents)", async () => {
    const selected = makeTransaction({
      id: "tx_r1",
      date: "2026-04-01",
      recurrence: { ...baseRecurrence, enabled: false, generatedFrom: "tx_parent" },
    })

    const seriesBeforeDelete = [
      makeTransaction({ id: "tx_parent", date: "2026-03-01" }),
      selected,
      makeTransaction({
        id: "tx_r2",
        date: "2026-05-01",
        recurrence: { ...baseRecurrence, enabled: false, generatedFrom: "tx_parent" },
      }),
    ]

    const parentAfterDelete = makeTransaction({ id: "tx_parent", date: "2026-03-01" })

    mockApiGet.mockResolvedValueOnce(seriesBeforeDelete).mockResolvedValueOnce([parentAfterDelete])
    mockApiDelete.mockResolvedValue({})
    mockApiPut.mockResolvedValue(parentAfterDelete)

    const hook = useTransactions()
    await hook.deleteRecurrence(selected, "followingEvents")

    expect(mockApiDelete).toHaveBeenCalledTimes(2)
    expect(mockApiDelete).toHaveBeenCalledWith("/transactions/tx_r1")
    expect(mockApiDelete).toHaveBeenCalledWith("/transactions/tx_r2")

    expect(mockApiPut).toHaveBeenCalledTimes(1)
    expect(mockApiPut).toHaveBeenCalledWith(
      "/transactions/tx_parent",
      expect.objectContaining({
        id: "tx_parent",
        recurrence: expect.objectContaining({ enabled: false, generatedFrom: undefined }),
      }),
    )
  })

  it("deleteTransaction com applyMode=future remove apenas futuros da serie", async () => {
    const selected = makeTransaction({
      id: "tx_r1",
      date: "2026-04-01",
      recurrence: { ...baseRecurrence, enabled: false, generatedFrom: "tx_parent" },
    })

    const allTransactions = [
      makeTransaction({ id: "tx_parent", date: "2026-03-01" }),
      selected,
      makeTransaction({
        id: "tx_r2",
        date: "2026-05-01",
        recurrence: { ...baseRecurrence, enabled: false, generatedFrom: "tx_parent" },
      }),
    ]

    mockApiGet.mockResolvedValueOnce(selected).mockResolvedValueOnce(allTransactions)
    mockApiDelete.mockResolvedValue({})

    const hook = useTransactions()
    await hook.deleteTransaction("tx_r1", { applyMode: "future" })

    expect(mockApiDelete).toHaveBeenCalledTimes(1)
    expect(mockApiDelete).toHaveBeenCalledWith("/transactions/tx_r2")
  })
})
