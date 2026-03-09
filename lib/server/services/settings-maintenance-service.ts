import { prisma } from "@/lib/server/db/prisma"

export type SeedTableKey =
  | "mmx_areas"
  | "mmx_category_groups"
  | "mmx_categories"
  | "mmx_transactions"
  | "mmx_contacts"

export type SeedData = Record<SeedTableKey, unknown[]>

type ImportResult = {
  imported: Record<SeedTableKey, number>
}

type ClearResult = {
  cleared: Record<SeedTableKey, number>
}

type CountResult = {
  count: number
}

type SettingsDelegate = {
  findMany: (args?: unknown) => Promise<unknown[]>
  createMany: (args: unknown) => Promise<CountResult>
  deleteMany: (args: unknown) => Promise<CountResult>
}

type SettingsDbTransactionClient = {
  area: SettingsDelegate
  categoryGroup: SettingsDelegate
  category: SettingsDelegate
  transaction: SettingsDelegate
  contact: SettingsDelegate
}

type SettingsDbClient = SettingsDbTransactionClient & {
  $transaction: <T>(callback: (tx: SettingsDbTransactionClient) => Promise<T>) => Promise<T>
}

const DEFAULT_TABLES: SeedTableKey[] = [
  "mmx_areas",
  "mmx_category_groups",
  "mmx_categories",
  "mmx_transactions",
  "mmx_contacts",
]

function normalizeSeedTableKey(value: unknown): SeedTableKey {
  if (typeof value !== "string") {
    throw new Error("Tabela invalida")
  }

  if (value === "mmx_areas") return "mmx_areas"
  if (value === "mmx_category_groups") return "mmx_category_groups"
  if (value === "mmx_categories") return "mmx_categories"
  if (value === "mmx_transactions") return "mmx_transactions"
  if (value === "mmx_contacts") return "mmx_contacts"

  throw new Error("Tabela invalida")
}

function normalizeAreaType(value: unknown): "INCOME" | "EXPENSE" | "FIXED_EXPENSES" | "DAILY_EXPENSES" | "PERSONAL" | "TAXES_FEES" {
  if (typeof value !== "string") {
    throw new Error("Tipo da area invalido")
  }

  const normalized = value.trim().toUpperCase().replace(/-/g, "_")

  if (normalized === "INCOME") return "INCOME"
  if (normalized === "EXPENSE") return "EXPENSE"
  if (normalized === "FIXED_EXPENSES") return "FIXED_EXPENSES"
  if (normalized === "DAILY_EXPENSES") return "DAILY_EXPENSES"
  if (normalized === "PERSONAL") return "PERSONAL"
  if (normalized === "TAXES_FEES") return "TAXES_FEES"

  throw new Error("Tipo da area invalido")
}

function normalizeCategoryType(value: unknown): "INCOME" | "EXPENSE" {
  if (typeof value !== "string") {
    throw new Error("Tipo da categoria invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "INCOME") return "INCOME"
  if (normalized === "EXPENSE") return "EXPENSE"

  throw new Error("Tipo da categoria invalido")
}

function normalizeTransactionType(value: unknown): "INCOME" | "EXPENSE" {
  if (typeof value !== "string") {
    throw new Error("Tipo da transacao invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "INCOME") return "INCOME"
  if (normalized === "EXPENSE") return "EXPENSE"

  throw new Error("Tipo da transacao invalido")
}

function normalizeActiveInactiveStatus(value: unknown, kind: "area" | "category" | "group" | "contact"): "ACTIVE" | "INACTIVE" {
  if (typeof value !== "string") {
    throw new Error(`Status invalido para ${kind}`)
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "ACTIVE") return "ACTIVE"
  if (normalized === "INACTIVE") return "INACTIVE"
  throw new Error(`Status invalido para ${kind}`)
}

function normalizeTransactionStatus(value: unknown): "PENDING" | "COMPLETED" | "CANCELLED" {
  if (typeof value !== "string") {
    throw new Error("Status da transacao invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "PENDING") return "PENDING"
  if (normalized === "COMPLETED") return "COMPLETED"
  if (normalized === "CANCELLED") return "CANCELLED"

  throw new Error("Status da transacao invalido")
}

function normalizeContactType(value: unknown): "CUSTOMER" | "SUPPLIER" {
  if (typeof value !== "string") {
    throw new Error("Tipo do contato invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "CUSTOMER") return "CUSTOMER"
  if (normalized === "SUPPLIER") return "SUPPLIER"

  throw new Error("Tipo do contato invalido")
}

function parseDate(value: unknown, field: string): Date {
  if (typeof value !== "string") {
    throw new Error(`Campo ${field} invalido`)
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Campo ${field} invalido`)
  }

  return parsed
}

function parseOptionalDate(value: unknown): Date | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }

  return parsed
}

function parseAmount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  throw new Error("Valor da transacao invalido")
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export class SettingsMaintenanceService {
  constructor(private readonly db: SettingsDbClient = prisma as unknown as SettingsDbClient) {}

  private resolveTables(tables?: unknown[]): SeedTableKey[] {
    if (!tables || tables.length === 0) {
      return [...DEFAULT_TABLES]
    }

    const parsed = tables.map((table) => normalizeSeedTableKey(table))
    return Array.from(new Set(parsed))
  }

  async exportData(userId: string, tables?: unknown[]): Promise<Partial<SeedData>> {
    const selectedTables = this.resolveTables(tables)
    const result: Partial<SeedData> = {}

    if (selectedTables.includes("mmx_areas")) {
      result.mmx_areas = await this.db.area.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })
    }

    if (selectedTables.includes("mmx_category_groups")) {
      result.mmx_category_groups = await this.db.categoryGroup.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })
    }

    if (selectedTables.includes("mmx_categories")) {
      result.mmx_categories = await this.db.category.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })
    }

    if (selectedTables.includes("mmx_transactions")) {
      result.mmx_transactions = await this.db.transaction.findMany({ where: { userId }, orderBy: { date: "asc" } })
    }

    if (selectedTables.includes("mmx_contacts")) {
      result.mmx_contacts = await this.db.contact.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })
    }

    return result
  }

  async clearData(userId: string, tables?: unknown[]): Promise<ClearResult> {
    const selectedTables = this.resolveTables(tables)

    const cleared: Record<SeedTableKey, number> = {
      mmx_areas: 0,
      mmx_category_groups: 0,
      mmx_categories: 0,
      mmx_transactions: 0,
      mmx_contacts: 0,
    }

    await this.db.$transaction(async (tx) => {
      // A ordem evita possiveis conflitos de referencia em bancos com FKs.
      if (selectedTables.includes("mmx_transactions")) {
        const deleted = await tx.transaction.deleteMany({ where: { userId } })
        cleared.mmx_transactions = deleted.count
      }

      if (selectedTables.includes("mmx_categories")) {
        const deleted = await tx.category.deleteMany({ where: { userId } })
        cleared.mmx_categories = deleted.count
      }

      if (selectedTables.includes("mmx_category_groups")) {
        const deleted = await tx.categoryGroup.deleteMany({ where: { userId } })
        cleared.mmx_category_groups = deleted.count
      }

      if (selectedTables.includes("mmx_contacts")) {
        const deleted = await tx.contact.deleteMany({ where: { userId } })
        cleared.mmx_contacts = deleted.count
      }

      if (selectedTables.includes("mmx_areas")) {
        const deleted = await tx.area.deleteMany({ where: { userId } })
        cleared.mmx_areas = deleted.count
      }
    })

    return { cleared }
  }

  async importData(userId: string, seedData: unknown): Promise<ImportResult> {
    if (!isRecord(seedData)) {
      throw new Error("Payload de importacao invalido")
    }

    const requiredKeys: SeedTableKey[] = [
      "mmx_areas",
      "mmx_category_groups",
      "mmx_categories",
      "mmx_transactions",
      "mmx_contacts",
    ]

    for (const key of requiredKeys) {
      if (!Array.isArray(seedData[key])) {
        throw new Error("JSON invalido. Verifique as tabelas obrigatorias")
      }
    }

    const areas = (seedData.mmx_areas as unknown[]).filter(isRecord)
    const categoryGroups = (seedData.mmx_category_groups as unknown[]).filter(isRecord)
    const categories = (seedData.mmx_categories as unknown[]).filter(isRecord)
    const transactions = (seedData.mmx_transactions as unknown[]).filter(isRecord)
    const contacts = (seedData.mmx_contacts as unknown[]).filter(isRecord)

    const imported: Record<SeedTableKey, number> = {
      mmx_areas: 0,
      mmx_category_groups: 0,
      mmx_categories: 0,
      mmx_transactions: 0,
      mmx_contacts: 0,
    }

    await this.db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({ where: { userId } })
      await tx.category.deleteMany({ where: { userId } })
      await tx.categoryGroup.deleteMany({ where: { userId } })
      await tx.contact.deleteMany({ where: { userId } })
      await tx.area.deleteMany({ where: { userId } })

      if (areas.length > 0) {
        const created = await tx.area.createMany({
          data: areas.map((item) => ({
            id: typeof item.id === "string" ? item.id : undefined,
            userId,
            name: typeof item.name === "string" ? item.name : "",
            description: typeof item.description === "string" ? item.description : null,
            type: normalizeAreaType(item.type),
            color: typeof item.color === "string" ? item.color : "#64748B",
            icon: typeof item.icon === "string" ? item.icon : "Folder",
            status: normalizeActiveInactiveStatus(item.status ?? "ACTIVE", "area"),
            createdAt: parseOptionalDate(item.createdAt),
            updatedAt: parseOptionalDate(item.updatedAt),
          })),
          skipDuplicates: true,
        })
        imported.mmx_areas = created.count
      }

      if (categoryGroups.length > 0) {
        const created = await tx.categoryGroup.createMany({
          data: categoryGroups.map((item) => ({
            id: typeof item.id === "string" ? item.id : undefined,
            userId,
            name: typeof item.name === "string" ? item.name : "",
            description: typeof item.description === "string" ? item.description : null,
            color: typeof item.color === "string" ? item.color : "#64748B",
            icon: typeof item.icon === "string" ? item.icon : "Folder",
            status: normalizeActiveInactiveStatus(item.status ?? "ACTIVE", "group"),
            areaId: typeof item.areaId === "string" ? item.areaId : null,
            categoryIds: Array.isArray(item.categoryIds) ? item.categoryIds.filter((id) => typeof id === "string") : [],
            createdAt: parseOptionalDate(item.createdAt),
            updatedAt: parseOptionalDate(item.updatedAt),
          })),
          skipDuplicates: true,
        })
        imported.mmx_category_groups = created.count
      }

      if (categories.length > 0) {
        const created = await tx.category.createMany({
          data: categories.map((item) => ({
            id: typeof item.id === "string" ? item.id : undefined,
            userId,
            name: typeof item.name === "string" ? item.name : "",
            description: typeof item.description === "string" ? item.description : null,
            type: normalizeCategoryType(item.type),
            categoryGroupId: typeof item.categoryGroupId === "string" ? item.categoryGroupId : null,
            areaId: typeof item.areaId === "string" ? item.areaId : null,
            status: normalizeActiveInactiveStatus(item.status ?? "ACTIVE", "category"),
            createdAt: parseOptionalDate(item.createdAt),
            updatedAt: parseOptionalDate(item.updatedAt),
          })),
          skipDuplicates: true,
        })
        imported.mmx_categories = created.count
      }

      if (transactions.length > 0) {
        const created = await tx.transaction.createMany({
          data: transactions.map((item) => ({
            id: typeof item.id === "string" ? item.id : undefined,
            userId,
            description: typeof item.description === "string" ? item.description : "",
            amount: parseAmount(item.amount),
            type: normalizeTransactionType(item.type),
            categoryId: typeof item.categoryId === "string" ? item.categoryId : "",
            contactId: typeof item.contactId === "string" ? item.contactId : null,
            date: parseDate(item.date, "date"),
            status: normalizeTransactionStatus(item.status ?? "PENDING"),
            notes: typeof item.notes === "string" ? item.notes : null,
            recurrence: isRecord(item.recurrence) || Array.isArray(item.recurrence) ? item.recurrence : undefined,
            areaId: typeof item.areaId === "string" ? item.areaId : null,
            categoryGroupId: typeof item.categoryGroupId === "string" ? item.categoryGroupId : null,
            createdAt: parseOptionalDate(item.createdAt),
            updatedAt: parseOptionalDate(item.updatedAt),
          })),
          skipDuplicates: true,
        })
        imported.mmx_transactions = created.count
      }

      if (contacts.length > 0) {
        const created = await tx.contact.createMany({
          data: contacts.map((item) => ({
            id: typeof item.id === "string" ? item.id : undefined,
            userId,
            name: typeof item.name === "string" ? item.name : "",
            email: typeof item.email === "string" ? item.email : null,
            phone: typeof item.phone === "string" ? item.phone : null,
            identifier: typeof item.identifier === "string" ? item.identifier : null,
            type: normalizeContactType(item.type),
            status: normalizeActiveInactiveStatus(item.status ?? "ACTIVE", "contact"),
            createdAt: parseOptionalDate(item.createdAt),
            updatedAt: parseOptionalDate(item.updatedAt),
          })),
          skipDuplicates: true,
        })
        imported.mmx_contacts = created.count
      }
    })

    return { imported }
  }
}
