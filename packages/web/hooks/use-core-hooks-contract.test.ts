import { beforeEach, describe, expect, it, vi } from "vitest"
import useSWR from "swr"
import { api } from "@/lib/client/api"
import { useAreas } from "./use-areas"
import { useCategories } from "./use-categories"
import { useContacts } from "./use-contacts"
import { useTransactions } from "./use-transactions"

vi.mock("swr", () => ({
  default: vi.fn(),
  mutate: vi.fn(),
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

describe("core hooks contract stability", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("useAreas keeps public return contract", () => {
    const mutate = vi.fn()

    mockUseSWR.mockReturnValue({
      data: [{ id: "area_1", name: "Area 1" }],
      error: undefined,
      mutate,
      isLoading: false,
    } as unknown as ReturnType<typeof useSWR>)

    const hook = useAreas()

    expect(hook.areas).toHaveLength(1)
    expect(hook.isLoading).toBe(false)
    expect(hook.loading).toBe(false)
    expect(typeof hook.createArea).toBe("function")
    expect(typeof hook.updateArea).toBe("function")
    expect(typeof hook.deleteArea).toBe("function")
  })

  it("useCategories keeps public return contract", () => {
    const mutate = vi.fn()

    mockUseSWR.mockReturnValue({
      data: [{ id: "cat_1", name: "Categoria", type: "income" }],
      error: undefined,
      mutate,
      isLoading: false,
    } as unknown as ReturnType<typeof useSWR>)

    const hook = useCategories()

    expect(hook.categories).toHaveLength(1)
    expect(hook.isLoading).toBe(false)
    expect(typeof hook.createCategory).toBe("function")
    expect(typeof hook.updateCategory).toBe("function")
    expect(typeof hook.deleteCategory).toBe("function")
  })

  it("useContacts keeps public return contract", () => {
    const mutate = vi.fn()

    mockUseSWR.mockReturnValue({
      data: [{ id: "contact_1", name: "Contato" }],
      error: undefined,
      mutate,
      isLoading: false,
    } as unknown as ReturnType<typeof useSWR>)

    const hook = useContacts()

    expect(hook.contacts).toHaveLength(1)
    expect(hook.isLoading).toBe(false)
    expect(typeof hook.createContact).toBe("function")
    expect(typeof hook.updateContact).toBe("function")
    expect(typeof hook.deleteContact).toBe("function")
  })

  it("useTransactions keeps endpoint/fetcher and public return contract", () => {
    const mutate = vi.fn()

    mockUseSWR.mockReturnValue({
      data: [{ id: "tx_1", description: "Movimento" }],
      error: undefined,
      mutate,
      isLoading: false,
    } as unknown as ReturnType<typeof useSWR>)

    const hook = useTransactions({ categoryId: "cat_1", month: "2026-03" })

    expect(mockUseSWR).toHaveBeenCalledWith("/transactions?categoryId=cat_1&month=2026-03", api.get)
    expect(hook.transactions).toHaveLength(1)
    expect(hook.isLoading).toBe(false)
    expect(typeof hook.createTransaction).toBe("function")
    expect(typeof hook.updateTransaction).toBe("function")
    expect(typeof hook.deleteTransaction).toBe("function")
  })
})
