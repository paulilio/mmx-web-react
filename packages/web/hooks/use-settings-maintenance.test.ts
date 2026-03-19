import { beforeEach, describe, expect, it, vi } from "vitest"
import { mutate } from "swr"
import { api } from "@/lib/client/api"
import { useSettingsMaintenance } from "./use-settings-maintenance"

vi.mock("swr", () => ({
  mutate: vi.fn(),
}))

vi.mock("@/lib/client/api", () => ({
  api: {
    post: vi.fn(),
  },
}))

const mockMutate = vi.mocked(mutate)
const mockApiPost = vi.mocked(api.post)

describe("use-settings-maintenance", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("exportData valida selecao e usa endpoint esperado", async () => {
    const hook = useSettingsMaintenance()

    await expect(hook.exportData([])).rejects.toThrow("Selecione pelo menos uma tabela para exportar")

    mockApiPost.mockResolvedValueOnce({ mmx_areas: [{ id: "a-1" }] })

    const result = await hook.exportData(["mmx_areas"])

    expect(mockApiPost).toHaveBeenCalledWith("/settings/export", {
      tables: ["mmx_areas"],
    })
    expect(result).toEqual({ mmx_areas: [{ id: "a-1" }] })
  })

  it("importData rejeita JSON invalido sem chamar API", async () => {
    const hook = useSettingsMaintenance()

    await expect(hook.importData({ mmx_areas: [] })).rejects.toThrow("JSON invalido")

    expect(mockApiPost).not.toHaveBeenCalled()
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it("importData envia payload para API e revalida caches", async () => {
    const hook = useSettingsMaintenance()

    const seedData = {
      mmx_areas: [{ id: "a-1" }],
      mmx_category_groups: [{ id: "cg-1" }],
      mmx_categories: [{ id: "c-1" }],
      mmx_transactions: [{ id: "t-1" }],
      mmx_contacts: [{ id: "ct-1" }],
    }

    mockApiPost.mockResolvedValueOnce({
      imported: {
        mmx_areas: 1,
        mmx_category_groups: 1,
        mmx_categories: 1,
        mmx_transactions: 1,
        mmx_contacts: 1,
      },
    })

    const result = await hook.importData(seedData)

    expect(mockApiPost).toHaveBeenCalledWith("/settings/import", { data: seedData })
    expect(result.imported.mmx_transactions).toBe(1)

    expect(mockMutate).toHaveBeenCalledWith("/areas")
    expect(mockMutate).toHaveBeenCalledWith("/category-groups")
    expect(mockMutate).toHaveBeenCalledWith("/categories")
    expect(mockMutate).toHaveBeenCalledWith("/transactions")
    expect(mockMutate).toHaveBeenCalledWith("/contacts")
    expect(mockMutate).toHaveBeenCalledWith("/reports/summary")
    expect(mockMutate).toHaveBeenCalledWith("/reports/aging")
    expect(mockMutate).toHaveBeenCalledWith("/reports/cashflow")
  })

  it("clearData envia tabelas opcionais e revalida caches", async () => {
    const hook = useSettingsMaintenance()

    mockApiPost.mockResolvedValueOnce({
      cleared: {
        mmx_areas: 2,
        mmx_category_groups: 0,
        mmx_categories: 4,
        mmx_transactions: 0,
        mmx_contacts: 0,
      },
    })

    await hook.clearData(["mmx_areas", "mmx_categories"])

    expect(mockApiPost).toHaveBeenCalledWith("/settings/clear", {
      tables: ["mmx_areas", "mmx_categories"],
    })

    mockApiPost.mockResolvedValueOnce({
      cleared: {
        mmx_areas: 0,
        mmx_category_groups: 0,
        mmx_categories: 0,
        mmx_transactions: 0,
        mmx_contacts: 0,
      },
    })

    await hook.clearData()

    expect(mockApiPost).toHaveBeenCalledWith("/settings/clear", {
      tables: undefined,
    })
    expect(mockMutate).toHaveBeenCalledWith("/reports/cashflow")
  })
})
