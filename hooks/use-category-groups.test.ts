import { beforeEach, describe, expect, it, vi } from "vitest"
import useSWR, { mutate as globalMutate } from "swr"
import { api } from "@/lib/client/api"
import { useCategoryGroups } from "./use-category-groups"

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
const mockGlobalMutate = vi.mocked(globalMutate)
const mockApiGet = vi.mocked(api.get)
const mockApiPost = vi.mocked(api.post)
const mockApiPut = vi.mocked(api.put)
const mockApiDelete = vi.mocked(api.delete)

describe("use-category-groups", () => {
  const mutateMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseSWR.mockReturnValue({
      data: [
        {
          id: "cg-1",
          name: "Fixas",
          color: "#3b82f6",
          icon: "home",
          status: "active",
        },
      ],
      error: undefined,
      mutate: mutateMock,
      isLoading: false,
      isValidating: false,
    } as unknown as ReturnType<typeof useSWR>)
  })

  it("mantem contrato publico e endpoint/fetcher esperados", () => {
    const hook = useCategoryGroups()

    expect(mockUseSWR).toHaveBeenCalledWith("/category-groups", api.get)
    expect(hook.categoryGroups).toHaveLength(1)
    expect(hook.isLoading).toBe(false)
    expect(typeof hook.createCategoryGroup).toBe("function")
    expect(typeof hook.updateCategoryGroup).toBe("function")
    expect(typeof hook.deleteCategoryGroup).toBe("function")
    expect(typeof hook.mutate).toBe("function")
  })

  it("createCategoryGroup usa boundary API e revalida SWR", async () => {
    mockApiPost.mockResolvedValueOnce({ id: "cg-2" })

    const hook = useCategoryGroups()
    await hook.createCategoryGroup({
      name: "Variaveis",
      color: "#ef4444",
      icon: "wallet",
      status: "active",
    })

    expect(mockApiPost).toHaveBeenCalledWith("/category-groups", {
      name: "Variaveis",
      color: "#ef4444",
      icon: "wallet",
      status: "active",
    })
    expect(mutateMock).toHaveBeenCalledTimes(1)
  })

  it("updateCategoryGroup usa boundary API e revalida SWR", async () => {
    mockApiPut.mockResolvedValueOnce({ id: "cg-1" })

    const hook = useCategoryGroups()
    await hook.updateCategoryGroup("cg-1", {
      name: "Fixas atualizadas",
    })

    expect(mockApiPut).toHaveBeenCalledWith("/category-groups/cg-1", {
      name: "Fixas atualizadas",
    })
    expect(mutateMock).toHaveBeenCalledTimes(1)
  })

  it("deleteCategoryGroup limpa categorias associadas e revalida chaves", async () => {
    mockApiGet.mockResolvedValueOnce([
      { id: "cat-1", name: "Aluguel", categoryGroupId: "cg-1" },
      { id: "cat-2", name: "Mercado", categoryGroupId: "cg-1" },
      { id: "cat-3", name: "Salario", categoryGroupId: "cg-9" },
    ])
    mockApiPut.mockResolvedValue({})
    mockApiDelete.mockResolvedValue({})

    const hook = useCategoryGroups()
    await hook.deleteCategoryGroup("cg-1")

    expect(mockApiGet).toHaveBeenCalledWith("/categories")
    expect(mockApiPut).toHaveBeenCalledTimes(2)
    expect(mockApiPut).toHaveBeenCalledWith(
      "/categories/cat-1",
      expect.objectContaining({ id: "cat-1", categoryGroupId: undefined }),
    )
    expect(mockApiPut).toHaveBeenCalledWith(
      "/categories/cat-2",
      expect.objectContaining({ id: "cat-2", categoryGroupId: undefined }),
    )
    expect(mockApiDelete).toHaveBeenCalledWith("/category-groups/cg-1")
    expect(mockGlobalMutate).toHaveBeenCalledWith("/categories")
    expect(mutateMock).toHaveBeenCalledTimes(1)
  })
})
