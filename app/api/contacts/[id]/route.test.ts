import { beforeEach, describe, expect, it, vi } from "vitest"

const { serviceMock } = vi.hoisted(() => {
  return {
    serviceMock: {
      list: vi.fn(),
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
  }
})

vi.mock("../../../../lib/server/services", () => ({
  contactService: serviceMock,
}))

import { DELETE, GET, PUT } from "./route"

function makeRequest(options: {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: unknown
}) {
  const { url, method = "GET", headers, body } = options

  return {
    nextUrl: new URL(url),
    headers: new Headers(headers),
    json: async () => body,
    method,
  }
}

describe("/api/contacts/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 404 quando contato nao existe", async () => {
    serviceMock.getById.mockResolvedValueOnce(null)

    const response = await GET(
      makeRequest({ url: "http://localhost/api/contacts/contact-404?userId=user-1" }) as never,
      { params: { id: "contact-404" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe("CONTACT_NOT_FOUND")
  })

  it("GET retorna contato quando existe", async () => {
    serviceMock.getById.mockResolvedValueOnce({
      id: "contact-1",
      userId: "user-1",
      name: "Cliente A",
      email: "cliente@mmx.dev",
      phone: null,
      identifier: "12345678901",
      type: "CUSTOMER",
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    })

    const response = await GET(
      makeRequest({
        url: "http://localhost/api/contacts/contact-1",
        headers: { "x-user-id": "user-1" },
      }) as never,
      { params: { id: "contact-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.type).toBe("customer")
  })

  it("PUT retorna 404 quando service informa nao encontrado", async () => {
    serviceMock.update.mockRejectedValueOnce(new Error("Contato nao encontrado para este usuario"))

    const response = await PUT(
      makeRequest({
        url: "http://localhost/api/contacts/contact-404",
        method: "PUT",
        body: { userId: "user-1", name: "Novo nome" },
      }) as never,
      { params: { id: "contact-404" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe("CONTACT_NOT_FOUND")
  })

  it("DELETE remove contato e retorna payload mapeado", async () => {
    serviceMock.remove.mockResolvedValueOnce({
      id: "contact-1",
      userId: "user-1",
      name: "Cliente A",
      email: null,
      phone: null,
      identifier: "12345678901",
      type: "CUSTOMER",
      status: "INACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    const response = await DELETE(
      makeRequest({
        url: "http://localhost/api/contacts/contact-1?userId=user-1",
        method: "DELETE",
      }) as never,
      { params: { id: "contact-1" } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.status).toBe("inactive")
  })
})
