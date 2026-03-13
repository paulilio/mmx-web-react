import { beforeEach, describe, expect, it, vi } from "vitest"

const { settingsServiceMock } = vi.hoisted(() => {
  return {
    settingsServiceMock: {
      importData: vi.fn(),
      exportData: vi.fn(),
      clearData: vi.fn(),
    },
  }
})

vi.mock("@/lib/server/services", () => ({
  settingsMaintenanceService: settingsServiceMock,
}))

import { POST } from "./route"

function makeRequest(options: {
  url: string
  body?: unknown
  shouldThrowOnJson?: boolean
}) {
  const { url, body, shouldThrowOnJson = false } = options

  return {
    nextUrl: new URL(url),
    headers: new Headers(),
    json: async () => {
      if (shouldThrowOnJson) {
        throw new Error("JSON invalido")
      }
      return body
    },
    method: "POST",
  }
}

describe("/api/settings/import route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("POST retorna 401 quando autenticacao nao e informada", async () => {
    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/import",
        body: { data: { mmx_areas: [], mmx_category_groups: [], mmx_categories: [], mmx_transactions: [], mmx_contacts: [] } },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("AUTH_REQUIRED")
  })

  it("POST retorna 400 quando payload de importacao nao e informado", async () => {
    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/import?userId=user-1",
        body: {},
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("INVALID_INPUT")
  })

  it("POST importa seed e retorna 200", async () => {
    settingsServiceMock.importData.mockResolvedValueOnce({
      imported: {
        mmx_areas: 1,
        mmx_category_groups: 1,
        mmx_categories: 2,
        mmx_transactions: 3,
        mmx_contacts: 1,
      },
    })

    const seedData = {
      mmx_areas: [{ id: "a-1" }],
      mmx_category_groups: [{ id: "cg-1" }],
      mmx_categories: [{ id: "c-1" }],
      mmx_transactions: [{ id: "t-1" }],
      mmx_contacts: [{ id: "ct-1" }],
    }

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/import?userId=user-1",
        body: { data: seedData },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(settingsServiceMock.importData).toHaveBeenCalledWith("user-1", seedData)
    expect(payload.error).toBeNull()
    expect(payload.data.imported.mmx_transactions).toBe(3)
  })

  it("POST retorna 400 quando service falha", async () => {
    settingsServiceMock.importData.mockRejectedValueOnce(new Error("Falha interna"))

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/import?userId=user-1",
        body: {
          data: {
            mmx_areas: [],
            mmx_category_groups: [],
            mmx_categories: [],
            mmx_transactions: [],
            mmx_contacts: [],
          },
        },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("SETTINGS_IMPORT_ERROR")
  })
})
