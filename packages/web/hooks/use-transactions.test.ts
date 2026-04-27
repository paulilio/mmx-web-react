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
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockUseSWR = vi.mocked(useSWR)
const mockApiGet = vi.mocked(api.get)
const mockApiPost = vi.mocked(api.post)
const mockApiPatch = vi.mocked(api.patch)
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
    accountId: "acc_1",
    date: "2026-03-01",
    status: "pending",
    recurrence: baseRecurrence,
    templateId: "tpl_1",
    seriesIndex: 1,
    skipped: false,
    isException: false,
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

  it("updateTransaction com applyMode=all chama PATCH /transactions/recurring/:templateId", async () => {
    const tx = makeTransaction({ id: "tx_r1", templateId: "tpl_1", date: "2026-04-01" })
    mockApiGet.mockResolvedValue(tx)
    mockApiPatch.mockResolvedValue({ updated: 3, template: {} })

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

    expect(mockApiPatch).toHaveBeenCalledTimes(1)
    expect(mockApiPatch).toHaveBeenCalledWith(
      "/transactions/recurring/tpl_1",
      expect.objectContaining({
        applyMode: "all",
        patch: expect.objectContaining({
          amount: 245,
          description: "Conta ajustada",
        }),
      }),
    )
  })

  it("updateTransaction com applyMode=future passa fromDate da transação atual", async () => {
    const tx = makeTransaction({ id: "tx_r1", templateId: "tpl_1", date: "2026-04-01" })
    mockApiGet.mockResolvedValue(tx)
    mockApiPatch.mockResolvedValue({ updated: 2, template: {} })

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

    expect(mockApiPatch).toHaveBeenCalledTimes(1)
    expect(mockApiPatch).toHaveBeenCalledWith(
      "/transactions/recurring/tpl_1",
      expect.objectContaining({
        applyMode: "future",
        fromDate: "2026-04-01",
        patch: expect.objectContaining({ status: "completed" }),
      }),
    )
  })

  it("updateTransaction com applyMode=single chama PATCH /transactions/:id/exception", async () => {
    mockApiPatch.mockResolvedValue({})
    const hook = useTransactions()

    await hook.updateTransaction("tx_r1", {
      amount: 99,
      recurrence: {
        ...baseRecurrence,
        enabled: false,
        generatedFrom: "tx_parent",
        applyMode: "single",
      },
    })

    expect(mockApiPatch).toHaveBeenCalledTimes(1)
    expect(mockApiPatch).toHaveBeenCalledWith(
      "/transactions/tx_r1/exception",
      expect.objectContaining({ amount: 99 }),
    )
  })

  it("deleteRecurrence(followingEvents) traduz pra applyMode=future com fromTransactionId", async () => {
    const selected = makeTransaction({
      id: "tx_r1",
      templateId: "tpl_1",
      date: "2026-04-01",
    })
    mockApiGet.mockResolvedValue(selected)
    mockApiDelete.mockResolvedValue({})

    const hook = useTransactions()
    await hook.deleteRecurrence(selected, "followingEvents")

    expect(mockApiDelete).toHaveBeenCalledTimes(1)
    expect(mockApiDelete).toHaveBeenCalledWith(
      expect.stringContaining("/transactions/recurring/tpl_1?applyMode=future"),
    )
    expect(mockApiDelete.mock.calls[0]?.[0]).toContain("fromTransactionId=tx_r1")
  })

  it("deleteRecurrence(allEvents) chama DELETE com applyMode=all", async () => {
    const selected = makeTransaction({
      id: "tx_r1",
      templateId: "tpl_1",
    })
    mockApiGet.mockResolvedValue(selected)
    mockApiDelete.mockResolvedValue({})

    const hook = useTransactions()
    await hook.deleteRecurrence(selected, "allEvents")

    expect(mockApiDelete).toHaveBeenCalledTimes(1)
    expect(mockApiDelete).toHaveBeenCalledWith(
      expect.stringContaining("/transactions/recurring/tpl_1?applyMode=all"),
    )
  })

  it("deleteRecurrence(thisEvent) chama applyMode=single com fromTransactionId", async () => {
    const selected = makeTransaction({ id: "tx_r1", templateId: "tpl_1" })
    mockApiGet.mockResolvedValue(selected)
    mockApiDelete.mockResolvedValue({})

    const hook = useTransactions()
    await hook.deleteRecurrence(selected, "thisEvent")

    expect(mockApiDelete).toHaveBeenCalledTimes(1)
    expect(mockApiDelete).toHaveBeenCalledWith(
      expect.stringContaining("/transactions/recurring/tpl_1?applyMode=single"),
    )
    expect(mockApiDelete.mock.calls[0]?.[0]).toContain("fromTransactionId=tx_r1")
  })

  it("deleteTransaction sem applyMode chama DELETE /transactions/:id direto", async () => {
    mockApiDelete.mockResolvedValue({})
    const hook = useTransactions()
    await hook.deleteTransaction("tx_avulso")
    expect(mockApiDelete).toHaveBeenCalledTimes(1)
    expect(mockApiDelete).toHaveBeenCalledWith("/transactions/tx_avulso")
  })

  it("skipNextOccurrence chama POST /transactions/:id/skip", async () => {
    mockApiPost.mockResolvedValue({})
    const hook = useTransactions()
    await hook.skipNextOccurrence("tx_r5")
    expect(mockApiPost).toHaveBeenCalledTimes(1)
    expect(mockApiPost).toHaveBeenCalledWith("/transactions/tx_r5/skip", {})
  })

  it("toggleSeriesPause chama PATCH /transactions/recurring/:id/pause", async () => {
    mockApiPatch.mockResolvedValue({})
    const hook = useTransactions()
    await hook.toggleSeriesPause("tpl_1", true)
    expect(mockApiPatch).toHaveBeenCalledTimes(1)
    expect(mockApiPatch).toHaveBeenCalledWith(
      "/transactions/recurring/tpl_1/pause",
      { paused: true },
    )
  })

  it("duplicateTransaction chama POST /transactions/:id/duplicate", async () => {
    mockApiPost.mockResolvedValue({})
    const hook = useTransactions()
    await hook.duplicateTransaction("tx_5", { date: "2026-04-15" })
    expect(mockApiPost).toHaveBeenCalledTimes(1)
    expect(mockApiPost).toHaveBeenCalledWith(
      "/transactions/tx_5/duplicate",
      { date: "2026-04-15" },
    )
  })
})
