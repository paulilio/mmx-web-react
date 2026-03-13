import { beforeEach, describe, expect, it, vi } from "vitest"

class LocalStorageMock {
  private store = new Map<string, string>()

  clear() {
    this.store.clear()
  }

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  key(index: number) {
    const keys = Array.from(this.store.keys())
    return keys[index] ?? null
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  setItem(key: string, value: string) {
    this.store.set(key, value)
  }

  get length() {
    return this.store.size
  }
}

async function loadApiModule() {
  vi.resetModules()
  process.env.NEXT_PUBLIC_USE_API = "false"
  return import("./api")
}

async function loadApiModuleApiMode() {
  vi.resetModules()
  process.env.NEXT_PUBLIC_USE_API = "true"
  process.env.NEXT_PUBLIC_API_MIGRATION_DOMAINS = ""
  return import("./api")
}

async function loadApiModuleApiModeWithMigration(domains: string) {
  vi.resetModules()
  process.env.NEXT_PUBLIC_USE_API = "true"
  process.env.NEXT_PUBLIC_API_MIGRATION_DOMAINS = domains
  return import("./api")
}

function seedAuthenticatedUser(userId = "user_test_1") {
  localStorage.setItem(
    "auth_user",
    JSON.stringify({
      id: userId,
      email: "tester@example.com",
    }),
  )
}

describe("lib/client/api mock budget adapter", () => {
  beforeEach(() => {
    const localStorageMock = new LocalStorageMock()
    vi.stubGlobal("localStorage", localStorageMock)
    vi.stubGlobal("window", { localStorage: localStorageMock })
    seedAuthenticatedUser()
  })

  it("should create, list, update and delete budget allocations in mock mode", async () => {
    const { postJSON, getJSON, putJSON, deleteJSON } = await loadApiModule()

    const created = await postJSON<{
      id: string
      month: string
      funded_amount: number
      available_amount: number
    }>("/budget-allocations", {
      budget_group_id: "group_food",
      month: "2026-03",
      planned_amount: 1000,
      funded_amount: 500,
      spent_amount: 100,
    })

    expect(created.id).toBeTruthy()
    expect(created.available_amount).toBe(400)

    const listed = await getJSON<Array<{ id: string; month: string }>>("/budget-allocations?month=2026-03")
    expect(listed).toHaveLength(1)
    expect(listed[0]?.id).toBe(created.id)

    const updated = await putJSON<{ funded_amount: number; available_amount: number }>(
      `/budget-allocations/${created.id}`,
      {
        funded_amount: 900,
        available_amount: 800,
      },
    )

    expect(updated.funded_amount).toBe(900)
    expect(updated.available_amount).toBe(800)

    await deleteJSON(`/budget-allocations/${created.id}`)

    const afterDelete = await getJSON<Array<{ id: string }>>("/budget-allocations?month=2026-03")
    expect(afterDelete).toHaveLength(0)
  })

  it("should add funds to existing or new allocation using budget add-funds endpoint", async () => {
    const { postJSON, getJSON } = await loadApiModule()

    const first = await postJSON<{ funded_amount: number; available_amount: number }>(
      "/budget/group_health/2026/3/add-funds",
      { amount: 200 },
    )

    expect(first.funded_amount).toBe(200)
    expect(first.available_amount).toBe(200)

    const second = await postJSON<{ funded_amount: number; available_amount: number }>(
      "/budget/group_health/2026/3/add-funds",
      { amount: 50 },
    )

    expect(second.funded_amount).toBe(250)
    expect(second.available_amount).toBe(250)

    const listed = await getJSON<Array<{ budget_group_id: string; month: string; funded_amount: number }>>(
      "/budget-allocations?month=2026-03",
    )

    expect(listed).toHaveLength(1)
    expect(listed[0]?.budget_group_id).toBe("group_health")
    expect(listed[0]?.funded_amount).toBe(250)
  })

  it("should transfer funds between allocations using transfer endpoint", async () => {
    const { postJSON, getJSON } = await loadApiModule()

    await postJSON("/budget-allocations", {
      budget_group_id: "group_from",
      month: "2026-04",
      planned_amount: 0,
      funded_amount: 1000,
      spent_amount: 100,
    })

    await postJSON("/budget-allocations", {
      budget_group_id: "group_to",
      month: "2026-04",
      planned_amount: 0,
      funded_amount: 200,
      spent_amount: 0,
    })

    const transferResult = await postJSON<{ from: { available_amount: number }; to: { funded_amount: number } }>(
      "/budget/transfer-funds",
      {
        fromBudgetGroupId: "group_from",
        toBudgetGroupId: "group_to",
        amount: 150,
        month: 4,
        year: 2026,
      },
    )

    expect(transferResult.from.available_amount).toBe(750)
    expect(transferResult.to.funded_amount).toBe(350)

    const listed = await getJSON<Array<{ budget_group_id: string; available_amount: number; funded_amount: number }>>(
      "/budget-allocations?month=2026-04",
    )

    const from = listed.find((item) => item.budget_group_id === "group_from")
    const to = listed.find((item) => item.budget_group_id === "group_to")

    expect(from?.available_amount).toBe(750)
    expect(to?.funded_amount).toBe(350)
  })
})

describe("lib/client/api API mode compatibility", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it("should preserve compatibility with legacy payloads without envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ id: "area_1", name: "Area Legacy" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    )

    const { getJSON } = await loadApiModuleApiMode()
    const result = await getJSON<Array<{ id: string; name: string }>>("/areas")

    expect(Array.isArray(result)).toBe(true)
    expect(result[0]?.id).toBe("area_1")
    expect(result[0]?.name).toBe("Area Legacy")
  })

  it("should unwrap successful envelope payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [{ id: "area_2", name: "Area Envelope" }],
            error: null,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    )

    const { getJSON } = await loadApiModuleApiMode()
    const result = await getJSON<Array<{ id: string; name: string }>>("/areas")

    expect(Array.isArray(result)).toBe(true)
    expect(result[0]?.id).toBe("area_2")
    expect(result[0]?.name).toBe("Area Envelope")
  })

  it("should throw explicit error when envelope contains error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: null,
            error: {
              code: "AUTH_REQUIRED",
              message: "Autenticacao obrigatoria",
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    )

    const { getJSON } = await loadApiModuleApiMode()

    await expect(getJSON("/areas")).rejects.toMatchObject({
      name: "ApiError",
      status: 200,
      message: "Autenticacao obrigatoria",
    })
  })

  it("should throw explicit connectivity error when API is unavailable (no fallback)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Failed to fetch")),
    )

    const { getJSON } = await loadApiModuleApiMode()

    await expect(getJSON("/areas")).rejects.toMatchObject({
      name: "ApiError",
      status: 0,
      message: expect.stringContaining("Erro de conectividade com a API"),
    })
  })

  it("should route category-groups to first-party API in USE_API=true", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [],
          error: null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)

    const { getJSON } = await loadApiModuleApiMode()
    await getJSON("/category-groups")

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/category-groups",
      expect.objectContaining({ method: "GET" }),
    )
  })

  it("should route reports to first-party API in USE_API=true", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            totalOpen: 0,
            totalOverdue: 0,
            totalNext7Days: 0,
            totalNext30Days: 0,
            totalReceivables: 0,
            totalPayables: 0,
            completedReceivables: 0,
            completedPayables: 0,
            pendingReceivables: 0,
            pendingPayables: 0,
          },
          error: null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)

    const { getJSON } = await loadApiModuleApiMode()
    await getJSON("/reports/summary")

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/reports/summary",
      expect.objectContaining({ method: "GET" }),
    )
  })

  it("should route reports to external API when reports migration is enabled", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            totalOpen: 0,
            totalOverdue: 0,
            totalNext7Days: 0,
            totalNext30Days: 0,
            totalReceivables: 0,
            totalPayables: 0,
            completedReceivables: 0,
            completedPayables: 0,
            pendingReceivables: 0,
            pendingPayables: 0,
          },
          error: null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)

    const { getJSON } = await loadApiModuleApiModeWithMigration("reports")
    await getJSON("/reports/summary")

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/reports/summary",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      }),
    )
  })

  it("should include credentials for external API_BASE requests in USE_API=true", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { ok: true },
          error: null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)

    const { getJSON } = await loadApiModuleApiMode()
    await getJSON("/external-health")

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/external-health",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      }),
    )
  })

  it("should preserve first-party requests without explicit credentials override", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [],
          error: null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)

    const { getJSON } = await loadApiModuleApiMode()
    await getJSON("/areas")

    const firstCallArgs = fetchMock.mock.calls[0]
    expect(firstCallArgs?.[0]).toBe("/api/areas")

    const requestInit = firstCallArgs?.[1] as Record<string, unknown>
    expect(requestInit.method).toBe("GET")
    expect("credentials" in requestInit).toBe(false)
  })
})
