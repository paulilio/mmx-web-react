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

describe("/api/settings/export route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("POST retorna 401 quando autenticacao nao e informada", async () => {
    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/export",
        body: { tables: ["mmx_areas"] },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe("AUTH_REQUIRED")
  })

  it("POST exporta dados e retorna 200", async () => {
    settingsServiceMock.exportData.mockResolvedValueOnce({
      mmx_areas: [{ id: "a-1" }],
      mmx_contacts: [{ id: "ct-1" }],
    })

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/export?userId=user-1",
        body: { tables: ["mmx_areas", "mmx_contacts"] },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(settingsServiceMock.exportData).toHaveBeenCalledWith("user-1", ["mmx_areas", "mmx_contacts"])
    expect(payload.error).toBeNull()
    expect(payload.data.mmx_areas.length).toBe(1)
  })

  it("POST retorna 400 para validacao de entrada quando tabela e invalida", async () => {
    settingsServiceMock.exportData.mockRejectedValueOnce(new Error("Tabela invalida"))

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/export?userId=user-1",
        body: { tables: ["foo"] },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("SETTINGS_EXPORT_ERROR")
  })

  it("POST retorna 400 quando service falha", async () => {
    settingsServiceMock.exportData.mockRejectedValueOnce(new Error("Falha interna"))

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/settings/export?userId=user-1",
        body: { tables: ["mmx_areas"] },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("SETTINGS_EXPORT_ERROR")
  })
})
