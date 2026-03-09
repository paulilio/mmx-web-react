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

vi.mock("@/lib/server/services/settings-maintenance-service", () => ({
  SettingsMaintenanceService: vi.fn(
    class {
      constructor() {
        return settingsServiceMock
      }
    },
  ),
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

describe("/api/settings/clear route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("POST retorna 401 quando autenticacao nao e informada", async () => {
    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/clear",
        body: { tables: ["mmx_areas"] },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("AUTH_REQUIRED")
  })

  it("POST limpa dados e retorna 200", async () => {
    settingsServiceMock.clearData.mockResolvedValueOnce({
      cleared: {
        mmx_areas: 3,
        mmx_category_groups: 2,
        mmx_categories: 4,
        mmx_transactions: 10,
        mmx_contacts: 1,
      },
    })

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/clear?userId=user-1",
        body: { tables: ["mmx_areas", "mmx_categories"] },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(settingsServiceMock.clearData).toHaveBeenCalledWith("user-1", ["mmx_areas", "mmx_categories"])
    expect(payload.error).toBeNull()
    expect(payload.data.cleared.mmx_areas).toBe(3)
  })

  it("POST retorna 400 para validacao de entrada quando tabela e invalida", async () => {
    settingsServiceMock.clearData.mockRejectedValueOnce(new Error("Tabela invalida"))

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/clear?userId=user-1",
        body: { tables: ["foo"] },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("SETTINGS_CLEAR_ERROR")
  })

  it("POST retorna 400 quando service falha", async () => {
    settingsServiceMock.clearData.mockRejectedValueOnce(new Error("Falha interna"))

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/clear?userId=user-1",
        body: { tables: ["mmx_contacts"] },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("SETTINGS_CLEAR_ERROR")
  })
})
