import { describe, expect, it, vi } from "vitest"
import { BelvoHttpClient, BelvoHttpError } from "./belvo-http.client"

function makeClient(fetchImpl: typeof fetch) {
  return new BelvoHttpClient({
    host: "https://sandbox.belvo.com",
    secretId: "id",
    secretPassword: "pwd",
    fetchImpl,
  })
}

describe("BelvoHttpClient", () => {
  it("envia Authorization Basic correto e retorna JSON", async () => {
    const fetchMock = vi.fn(async (url, init) => {
      const headers = (init as RequestInit | undefined)?.headers as Record<string, string> | undefined
      expect(headers?.Authorization).toBe("Basic " + Buffer.from("id:pwd").toString("base64"))
      expect(String(url)).toBe("https://sandbox.belvo.com/api/health/")
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })
    const client = makeClient(fetchMock as unknown as typeof fetch)
    const res = await client.request<{ ok: boolean }>("GET", "/api/health/")
    expect(res).toEqual({ ok: true })
  })

  it("lança BelvoHttpError em status >= 400", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ message: "no" }), { status: 401 }))
    const client = makeClient(fetchMock as unknown as typeof fetch)
    await expect(client.request("GET", "/api/links/")).rejects.toBeInstanceOf(BelvoHttpError)
  })

  it("getAllPages segue cursor next", async () => {
    let call = 0
    const fetchMock = vi.fn(async () => {
      call += 1
      if (call === 1) {
        return new Response(
          JSON.stringify({ results: [{ id: "a" }], next: "https://sandbox.belvo.com/api/x/?page=2" }),
          { status: 200 },
        )
      }
      return new Response(JSON.stringify({ results: [{ id: "b" }], next: null }), { status: 200 })
    })
    const client = makeClient(fetchMock as unknown as typeof fetch)
    const items = await client.getAllPages<{ id: string }>("/api/x/", "?page=1")
    expect(items.map((i) => i.id)).toEqual(["a", "b"])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
