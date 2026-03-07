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
