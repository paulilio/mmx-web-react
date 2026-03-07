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

vi.mock("../../../lib/server/services", () => ({
  contactService: serviceMock,
}))

import { GET, POST } from "./route"

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

describe("/api/contacts route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET retorna 400 quando userId nao e informado", async () => {
    const response = await GET(makeRequest({ url: "http://localhost/api/contacts" }) as never)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("USER_ID_REQUIRED")
  })

  it("GET retorna lista paginada com mapper aplicado", async () => {
    serviceMock.list.mockResolvedValueOnce({
      data: [
        {
          id: "contact-1",
          userId: "user-1",
          name: "Cliente A",
          email: "cliente@mmx.dev",
          phone: null,
          identifier: "12345678901",
          type: "CUSTOMER",
          status: "ACTIVE",
          createdAt: new Date("2026-03-01T00:00:00.000Z"),
          updatedAt: new Date("2026-03-02T00:00:00.000Z"),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    })

    const response = await GET(
      makeRequest({
        url: "http://localhost/api/contacts?userId=user-1&type=customer&status=active&page=1&pageSize=20",
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.error).toBeNull()
    expect(payload.data.data[0].type).toBe("customer")
    expect(payload.data.data[0].status).toBe("active")
    expect(payload.data.data[0].document).toBe("12345678901")
  })

  it("POST retorna 400 quando campos obrigatorios faltam", async () => {
    const response = await POST(
      makeRequest({
        url: "http://localhost/api/contacts",
        method: "POST",
        body: { userId: "user-1" },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe("INVALID_INPUT")
  })

  it("POST cria contato e retorna 201", async () => {
    serviceMock.create.mockResolvedValueOnce({
      id: "contact-1",
      userId: "user-1",
      name: "Fornecedor A",
      email: "fornecedor@mmx.dev",
      phone: null,
      identifier: "00900900900",
      type: "SUPPLIER",
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    })

    const response = await POST(
      makeRequest({
        url: "http://localhost/api/contacts",
        method: "POST",
        body: {
          userId: "user-1",
          name: "Fornecedor A",
          type: "supplier",
          document: "00900900900",
        },
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(payload.error).toBeNull()
    expect(payload.data.type).toBe("supplier")
  })
})
