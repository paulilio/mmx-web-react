import { describe, it, expect } from "vitest"
import { getDefaultSeed } from "./default-seed"

describe("default-seed", () => {
  it("retorna as 5 chaves obrigatórias com arrays", () => {
    const seed = getDefaultSeed()
    expect(Array.isArray(seed.mmx_areas)).toBe(true)
    expect(Array.isArray(seed.mmx_category_groups)).toBe(true)
    expect(Array.isArray(seed.mmx_categories)).toBe(true)
    expect(Array.isArray(seed.mmx_transactions)).toBe(true)
    expect(Array.isArray(seed.mmx_contacts)).toBe(true)
  })

  it("tem hierarquia consistente: 5 áreas, 8 grupos, 13 categorias, 10 contatos", () => {
    const seed = getDefaultSeed()
    expect(seed.mmx_areas.length).toBe(5)
    expect(seed.mmx_category_groups.length).toBe(8)
    expect(seed.mmx_categories.length).toBe(13)
    expect(seed.mmx_contacts.length).toBe(10)
  })

  it("gera ~75 transações distribuídas em 3 meses", () => {
    const seed = getDefaultSeed()
    expect(seed.mmx_transactions.length).toBeGreaterThanOrEqual(70)
    expect(seed.mmx_transactions.length).toBeLessThanOrEqual(80)
  })

  it("todas as transações referenciam categoryId, categoryGroupId e areaId existentes", () => {
    const seed = getDefaultSeed()
    const categoryIds = new Set((seed.mmx_categories as Array<{ id: string }>).map((c) => c.id))
    const groupIds = new Set((seed.mmx_category_groups as Array<{ id: string }>).map((g) => g.id))
    const areaIds = new Set((seed.mmx_areas as Array<{ id: string }>).map((a) => a.id))

    for (const tx of seed.mmx_transactions as Array<{
      categoryId: string
      categoryGroupId: string
      areaId: string
    }>) {
      expect(categoryIds.has(tx.categoryId)).toBe(true)
      expect(groupIds.has(tx.categoryGroupId)).toBe(true)
      expect(areaIds.has(tx.areaId)).toBe(true)
    }
  })

  it("todos os category_groups referenciam areaId existente", () => {
    const seed = getDefaultSeed()
    const areaIds = new Set((seed.mmx_areas as Array<{ id: string }>).map((a) => a.id))

    for (const group of seed.mmx_category_groups as Array<{ areaId: string }>) {
      expect(areaIds.has(group.areaId)).toBe(true)
    }
  })

  it("todas as categorias referenciam categoryGroupId e areaId existentes", () => {
    const seed = getDefaultSeed()
    const groupIds = new Set((seed.mmx_category_groups as Array<{ id: string }>).map((g) => g.id))
    const areaIds = new Set((seed.mmx_areas as Array<{ id: string }>).map((a) => a.id))

    for (const cat of seed.mmx_categories as Array<{ categoryGroupId: string; areaId: string }>) {
      expect(groupIds.has(cat.categoryGroupId)).toBe(true)
      expect(areaIds.has(cat.areaId)).toBe(true)
    }
  })

  it("usa enums em UPPERCASE como esperado pelo importData", () => {
    const seed = getDefaultSeed()
    const validAreaTypes = new Set([
      "INCOME",
      "EXPENSE",
      "FIXED_EXPENSES",
      "DAILY_EXPENSES",
      "PERSONAL",
      "TAXES_FEES",
    ])
    for (const area of seed.mmx_areas as Array<{ type: string; status: string }>) {
      expect(validAreaTypes.has(area.type)).toBe(true)
      expect(area.status).toBe("ACTIVE")
    }

    for (const cat of seed.mmx_categories as Array<{ type: string }>) {
      expect(["INCOME", "EXPENSE"]).toContain(cat.type)
    }

    for (const tx of seed.mmx_transactions as Array<{ type: string; status: string }>) {
      expect(["INCOME", "EXPENSE"]).toContain(tx.type)
      expect(["PENDING", "COMPLETED", "CANCELLED"]).toContain(tx.status)
    }

    for (const c of seed.mmx_contacts as Array<{ type: string }>) {
      expect(["CUSTOMER", "SUPPLIER"]).toContain(c.type)
    }
  })

  it("datas em formato YYYY-MM-DD válidas e distribuídas em 3 meses", () => {
    const seed = getDefaultSeed()
    const months = new Set<string>()
    for (const tx of seed.mmx_transactions as Array<{ date: string }>) {
      expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      const parsed = new Date(tx.date)
      expect(Number.isNaN(parsed.getTime())).toBe(false)
      months.add(tx.date.slice(0, 7))
    }
    expect(months.size).toBe(3)
  })
})
