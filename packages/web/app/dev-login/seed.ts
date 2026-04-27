// Frontend port do seed canonico em packages/api/src/modules/settings/application/default-seed.ts.
// Mantido em sincronia manual — backend permanece a fonte da verdade.
// Diferencas:
// - Usa crypto.randomUUID() (browser) em vez de node:crypto.
// - Enums lowercased (frontend storage usa lowercase: "income"/"expense"/"pending"/"completed").
// - Cada registro recebe userId explicito para o mock storage user-scoped.

interface SeedIds {
  AREA_INCOME: string
  AREA_FIXED: string
  AREA_DAILY: string
  AREA_PERSONAL: string
  AREA_TAXES: string
  GROUP_SALARY: string
  GROUP_EXTRA: string
  GROUP_HOUSING: string
  GROUP_UTILITIES: string
  GROUP_FOOD: string
  GROUP_TRANSPORT: string
  GROUP_HEALTH: string
  GROUP_TAXES: string
  CAT_SALARY: string
  CAT_FREELANCE: string
  CAT_RENT: string
  CAT_ELECTRIC: string
  CAT_WATER: string
  CAT_INTERNET: string
  CAT_GROCERIES: string
  CAT_RESTAURANT: string
  CAT_FUEL: string
  CAT_UBER: string
  CAT_GYM: string
  CAT_PHARMACY: string
  CAT_IPTU: string
  CONTACT_EMPLOYER: string
  CONTACT_CLIENT_JOAO: string
  CONTACT_CLIENT_TECHCORP: string
  CONTACT_CLIENT_MARIA: string
  CONTACT_CLIENT_MERCADOLIVRE: string
  CONTACT_LANDLORD: string
  CONTACT_ENEL: string
  CONTACT_SABESP: string
  CONTACT_VIVO: string
  CONTACT_CARREFOUR: string
  ACC_BB_CORRENTE: string
  ACC_MP_CORRENTE: string
  ACC_BB_INVEST: string
  ACC_BB_CNPJ: string
  ACC_BB_CC: string
  ACC_NUBANK_CC: string
  ACC_MP_CC: string
}

function pickAccountForCategory(categoryId: string, ID: SeedIds): string {
  if (categoryId === ID.CAT_SALARY) return ID.ACC_BB_CORRENTE
  if (categoryId === ID.CAT_FREELANCE) return ID.ACC_MP_CORRENTE
  if (categoryId === ID.CAT_RENT) return ID.ACC_BB_CORRENTE
  if (categoryId === ID.CAT_ELECTRIC) return ID.ACC_BB_CORRENTE
  if (categoryId === ID.CAT_WATER) return ID.ACC_BB_CORRENTE
  if (categoryId === ID.CAT_INTERNET) return ID.ACC_BB_CORRENTE
  if (categoryId === ID.CAT_IPTU) return ID.ACC_BB_CORRENTE
  if (categoryId === ID.CAT_GROCERIES) return ID.ACC_NUBANK_CC
  if (categoryId === ID.CAT_RESTAURANT) return ID.ACC_NUBANK_CC
  if (categoryId === ID.CAT_FUEL) return ID.ACC_MP_CC
  if (categoryId === ID.CAT_UBER) return ID.ACC_MP_CC
  if (categoryId === ID.CAT_GYM) return ID.ACC_BB_CC
  if (categoryId === ID.CAT_PHARMACY) return ID.ACC_BB_CC
  return ID.ACC_BB_CORRENTE
}

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  // fallback simples se ambiente nao suportar (teste node antigo)
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function makeIds(): SeedIds {
  const ns = uuid().replace(/-/g, "").slice(0, 16)
  const id = (label: string) => `seed_${ns}_${label}`
  return {
    AREA_INCOME: id("area_income"),
    AREA_FIXED: id("area_fixed"),
    AREA_DAILY: id("area_daily"),
    AREA_PERSONAL: id("area_personal"),
    AREA_TAXES: id("area_taxes"),
    GROUP_SALARY: id("group_salary"),
    GROUP_EXTRA: id("group_extra"),
    GROUP_HOUSING: id("group_housing"),
    GROUP_UTILITIES: id("group_utilities"),
    GROUP_FOOD: id("group_food"),
    GROUP_TRANSPORT: id("group_transport"),
    GROUP_HEALTH: id("group_health"),
    GROUP_TAXES: id("group_taxes"),
    CAT_SALARY: id("cat_salary"),
    CAT_FREELANCE: id("cat_freelance"),
    CAT_RENT: id("cat_rent"),
    CAT_ELECTRIC: id("cat_electric"),
    CAT_WATER: id("cat_water"),
    CAT_INTERNET: id("cat_internet"),
    CAT_GROCERIES: id("cat_groceries"),
    CAT_RESTAURANT: id("cat_restaurant"),
    CAT_FUEL: id("cat_fuel"),
    CAT_UBER: id("cat_uber"),
    CAT_GYM: id("cat_gym"),
    CAT_PHARMACY: id("cat_pharmacy"),
    CAT_IPTU: id("cat_iptu"),
    CONTACT_EMPLOYER: id("contact_employer"),
    CONTACT_CLIENT_JOAO: id("contact_client_joao"),
    CONTACT_CLIENT_TECHCORP: id("contact_client_techcorp"),
    CONTACT_CLIENT_MARIA: id("contact_client_maria"),
    CONTACT_CLIENT_MERCADOLIVRE: id("contact_client_mercadolivre"),
    CONTACT_LANDLORD: id("contact_landlord"),
    CONTACT_ENEL: id("contact_enel"),
    CONTACT_SABESP: id("contact_sabesp"),
    CONTACT_VIVO: id("contact_vivo"),
    CONTACT_CARREFOUR: id("contact_carrefour"),
    ACC_BB_CORRENTE: id("acc_bb_corrente"),
    ACC_MP_CORRENTE: id("acc_mp_corrente"),
    ACC_BB_INVEST: id("acc_bb_invest"),
    ACC_BB_CNPJ: id("acc_bb_cnpj"),
    ACC_BB_CC: id("acc_bb_cc"),
    ACC_NUBANK_CC: id("acc_nubank_cc"),
    ACC_MP_CC: id("acc_mp_cc"),
  }
}

function dateAt(offsetMonths: number, day: number): string {
  const today = new Date()
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - offsetMonths, 1))
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  const safeDay = Math.min(day, lastDay)
  d.setUTCDate(safeDay)
  return d.toISOString().split("T")[0]!
}

type SeedTransaction = {
  id: string
  userId: string
  description: string
  amount: number
  type: "income" | "expense"
  categoryId: string
  categoryGroupId: string
  areaId: string
  contactId: string | null
  date: string
  status: "pending" | "completed" | "cancelled"
  notes: string | null
  accountId: string
  createdAt: string
  updatedAt: string
}

function buildMonth(offsetMonths: number, ID: SeedIds, txPrefix: string, userId: string, isoNow: string): SeedTransaction[] {
  const monthLabel = `m${offsetMonths}`
  const isCurrentMonth = offsetMonths === 0
  const today = new Date()
  const todayDay = today.getUTCDate()

  const statusForDay = (day: number): "pending" | "completed" =>
    isCurrentMonth && day > todayDay ? "pending" : "completed"

  const txId = (label: string) => `${txPrefix}_${monthLabel}_${label}`

  const base = (rest: Omit<SeedTransaction, "userId" | "createdAt" | "updatedAt" | "accountId">): SeedTransaction => ({
    ...rest,
    accountId: pickAccountForCategory(rest.categoryId, ID),
    userId,
    createdAt: isoNow,
    updatedAt: isoNow,
  })

  const txs: SeedTransaction[] = [
    base({ id: txId("salary"), description: "Salário mensal", amount: 5500, type: "income", categoryId: ID.CAT_SALARY, categoryGroupId: ID.GROUP_SALARY, areaId: ID.AREA_INCOME, contactId: ID.CONTACT_EMPLOYER, date: dateAt(offsetMonths, 5), status: statusForDay(5), notes: null }),
    base({ id: txId("rent"), description: "Aluguel", amount: 1800, type: "expense", categoryId: ID.CAT_RENT, categoryGroupId: ID.GROUP_HOUSING, areaId: ID.AREA_FIXED, contactId: ID.CONTACT_LANDLORD, date: dateAt(offsetMonths, 10), status: statusForDay(10), notes: null }),
    base({ id: txId("electric"), description: "Conta de luz", amount: 215.4, type: "expense", categoryId: ID.CAT_ELECTRIC, categoryGroupId: ID.GROUP_UTILITIES, areaId: ID.AREA_FIXED, contactId: ID.CONTACT_ENEL, date: dateAt(offsetMonths, 15), status: statusForDay(15), notes: null }),
    base({ id: txId("water"), description: "Conta de água", amount: 84.9, type: "expense", categoryId: ID.CAT_WATER, categoryGroupId: ID.GROUP_UTILITIES, areaId: ID.AREA_FIXED, contactId: ID.CONTACT_SABESP, date: dateAt(offsetMonths, 18), status: statusForDay(18), notes: null }),
    base({ id: txId("internet"), description: "Internet fibra", amount: 99.9, type: "expense", categoryId: ID.CAT_INTERNET, categoryGroupId: ID.GROUP_UTILITIES, areaId: ID.AREA_FIXED, contactId: ID.CONTACT_VIVO, date: dateAt(offsetMonths, 12), status: statusForDay(12), notes: null }),
    base({ id: txId("groc1"), description: "Compras semana 1", amount: 387.55, type: "expense", categoryId: ID.CAT_GROCERIES, categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, contactId: ID.CONTACT_CARREFOUR, date: dateAt(offsetMonths, 3), status: statusForDay(3), notes: null }),
    base({ id: txId("groc2"), description: "Compras semana 2", amount: 412.3, type: "expense", categoryId: ID.CAT_GROCERIES, categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, contactId: ID.CONTACT_CARREFOUR, date: dateAt(offsetMonths, 11), status: statusForDay(11), notes: null }),
    base({ id: txId("groc3"), description: "Compras semana 3", amount: 354.8, type: "expense", categoryId: ID.CAT_GROCERIES, categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, contactId: ID.CONTACT_CARREFOUR, date: dateAt(offsetMonths, 18), status: statusForDay(18), notes: null }),
    base({ id: txId("groc4"), description: "Compras semana 4", amount: 421.05, type: "expense", categoryId: ID.CAT_GROCERIES, categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, contactId: ID.CONTACT_CARREFOUR, date: dateAt(offsetMonths, 26), status: statusForDay(26), notes: null }),
    base({ id: txId("rest1"), description: "Almoço executivo", amount: 58.5, type: "expense", categoryId: ID.CAT_RESTAURANT, categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, contactId: null, date: dateAt(offsetMonths, 5), status: statusForDay(5), notes: null }),
    base({ id: txId("rest2"), description: "Jantar com amigos", amount: 142.9, type: "expense", categoryId: ID.CAT_RESTAURANT, categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, contactId: null, date: dateAt(offsetMonths, 9), status: statusForDay(9), notes: null }),
    base({ id: txId("rest3"), description: "Lanche rápido", amount: 32.0, type: "expense", categoryId: ID.CAT_RESTAURANT, categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, contactId: null, date: dateAt(offsetMonths, 14), status: statusForDay(14), notes: null }),
    base({ id: txId("rest4"), description: "Pizza fim de semana", amount: 86.4, type: "expense", categoryId: ID.CAT_RESTAURANT, categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, contactId: null, date: dateAt(offsetMonths, 20), status: statusForDay(20), notes: null }),
    base({ id: txId("rest5"), description: "Cafeteria", amount: 24.5, type: "expense", categoryId: ID.CAT_RESTAURANT, categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, contactId: null, date: dateAt(offsetMonths, 27), status: statusForDay(27), notes: null }),
    base({ id: txId("fuel1"), description: "Abastecimento", amount: 245.0, type: "expense", categoryId: ID.CAT_FUEL, categoryGroupId: ID.GROUP_TRANSPORT, areaId: ID.AREA_DAILY, contactId: null, date: dateAt(offsetMonths, 4), status: statusForDay(4), notes: null }),
    base({ id: txId("fuel2"), description: "Abastecimento", amount: 230.0, type: "expense", categoryId: ID.CAT_FUEL, categoryGroupId: ID.GROUP_TRANSPORT, areaId: ID.AREA_DAILY, contactId: null, date: dateAt(offsetMonths, 12), status: statusForDay(12), notes: null }),
    base({ id: txId("fuel3"), description: "Abastecimento", amount: 260.5, type: "expense", categoryId: ID.CAT_FUEL, categoryGroupId: ID.GROUP_TRANSPORT, areaId: ID.AREA_DAILY, contactId: null, date: dateAt(offsetMonths, 20), status: statusForDay(20), notes: null }),
    base({ id: txId("fuel4"), description: "Abastecimento", amount: 235.0, type: "expense", categoryId: ID.CAT_FUEL, categoryGroupId: ID.GROUP_TRANSPORT, areaId: ID.AREA_DAILY, contactId: null, date: dateAt(offsetMonths, 28), status: statusForDay(28), notes: null }),
    base({ id: txId("uber1"), description: "Corrida Uber", amount: 38.9, type: "expense", categoryId: ID.CAT_UBER, categoryGroupId: ID.GROUP_TRANSPORT, areaId: ID.AREA_DAILY, contactId: null, date: dateAt(offsetMonths, 8), status: statusForDay(8), notes: null }),
    base({ id: txId("uber2"), description: "Corrida Uber", amount: 52.3, type: "expense", categoryId: ID.CAT_UBER, categoryGroupId: ID.GROUP_TRANSPORT, areaId: ID.AREA_DAILY, contactId: null, date: dateAt(offsetMonths, 22), status: statusForDay(22), notes: null }),
    base({ id: txId("gym"), description: "Mensalidade academia", amount: 119.9, type: "expense", categoryId: ID.CAT_GYM, categoryGroupId: ID.GROUP_HEALTH, areaId: ID.AREA_PERSONAL, contactId: null, date: dateAt(offsetMonths, 5), status: statusForDay(5), notes: null }),
    base({ id: txId("pharm1"), description: "Farmácia", amount: 87.4, type: "expense", categoryId: ID.CAT_PHARMACY, categoryGroupId: ID.GROUP_HEALTH, areaId: ID.AREA_PERSONAL, contactId: null, date: dateAt(offsetMonths, 10), status: statusForDay(10), notes: null }),
    base({ id: txId("pharm2"), description: "Farmácia", amount: 142.0, type: "expense", categoryId: ID.CAT_PHARMACY, categoryGroupId: ID.GROUP_HEALTH, areaId: ID.AREA_PERSONAL, contactId: null, date: dateAt(offsetMonths, 25), status: statusForDay(25), notes: null }),
  ]

  if (offsetMonths === 1 || offsetMonths === 0) {
    txs.push(base({ id: txId("freelance"), description: "Projeto freelance — landing page", amount: 1800, type: "income", categoryId: ID.CAT_FREELANCE, categoryGroupId: ID.GROUP_EXTRA, areaId: ID.AREA_INCOME, contactId: ID.CONTACT_CLIENT_TECHCORP, date: dateAt(offsetMonths, 22), status: statusForDay(22), notes: null }))
  }

  if (offsetMonths === 2) {
    txs.push(base({ id: txId("iptu"), description: "IPTU 2026 — parcela", amount: 287.0, type: "expense", categoryId: ID.CAT_IPTU, categoryGroupId: ID.GROUP_TAXES, areaId: ID.AREA_TAXES, contactId: null, date: dateAt(offsetMonths, 15), status: statusForDay(15), notes: "Pagamento mensal do IPTU" }))
  }

  return txs
}

export function buildDefaultSeed(userId: string) {
  const ID = makeIds()
  const txPrefix = `seed_tx_${uuid().replace(/-/g, "").slice(0, 16)}`
  const isoNow = new Date().toISOString()

  const transactions = [
    ...buildMonth(2, ID, txPrefix, userId, isoNow),
    ...buildMonth(1, ID, txPrefix, userId, isoNow),
    ...buildMonth(0, ID, txPrefix, userId, isoNow),
  ]

  const stamp = { userId, createdAt: isoNow, updatedAt: isoNow }

  const areas = [
    { id: ID.AREA_INCOME, name: "Recebimentos", type: "income", color: "#10B981", icon: "trending-up", status: "active", description: "Receitas e ganhos", ...stamp },
    { id: ID.AREA_FIXED, name: "Despesas Fixas", type: "fixed-expenses", color: "#3B82F6", icon: "home", status: "active", description: "Aluguel, contas e mensalidades", ...stamp },
    { id: ID.AREA_DAILY, name: "Despesas Variáveis", type: "daily-expenses", color: "#F59E0B", icon: "shopping-cart", status: "active", description: "Mercado, transporte e lazer", ...stamp },
    { id: ID.AREA_PERSONAL, name: "Pessoais", type: "personal", color: "#EC4899", icon: "heart", status: "active", description: "Saúde, educação e bem-estar", ...stamp },
    { id: ID.AREA_TAXES, name: "Encargos & Taxas", type: "taxes-fees", color: "#64748B", icon: "receipt", status: "active", description: "Impostos, tarifas e taxas", ...stamp },
  ]

  const categoryGroups = [
    { id: ID.GROUP_SALARY, name: "Salários", areaId: ID.AREA_INCOME, color: "#10B981", icon: "briefcase", status: "active", ...stamp },
    { id: ID.GROUP_EXTRA, name: "Renda Extra", areaId: ID.AREA_INCOME, color: "#059669", icon: "plus-circle", status: "active", ...stamp },
    { id: ID.GROUP_HOUSING, name: "Moradia", areaId: ID.AREA_FIXED, color: "#3B82F6", icon: "home", status: "active", ...stamp },
    { id: ID.GROUP_UTILITIES, name: "Contas Fixas", areaId: ID.AREA_FIXED, color: "#2563EB", icon: "zap", status: "active", ...stamp },
    { id: ID.GROUP_FOOD, name: "Alimentação", areaId: ID.AREA_DAILY, color: "#F59E0B", icon: "shopping-cart", status: "active", ...stamp },
    { id: ID.GROUP_TRANSPORT, name: "Transporte", areaId: ID.AREA_DAILY, color: "#8B5CF6", icon: "car", status: "active", ...stamp },
    { id: ID.GROUP_HEALTH, name: "Saúde & Bem-estar", areaId: ID.AREA_PERSONAL, color: "#EC4899", icon: "heart", status: "active", ...stamp },
    { id: ID.GROUP_TAXES, name: "Impostos", areaId: ID.AREA_TAXES, color: "#64748B", icon: "receipt", status: "active", ...stamp },
  ]

  const categories = [
    { id: ID.CAT_SALARY, name: "Salário", type: "income", categoryGroupId: ID.GROUP_SALARY, areaId: ID.AREA_INCOME, status: "active", ...stamp },
    { id: ID.CAT_FREELANCE, name: "Freelance", type: "income", categoryGroupId: ID.GROUP_EXTRA, areaId: ID.AREA_INCOME, status: "active", ...stamp },
    { id: ID.CAT_RENT, name: "Aluguel", type: "expense", categoryGroupId: ID.GROUP_HOUSING, areaId: ID.AREA_FIXED, status: "active", ...stamp },
    { id: ID.CAT_ELECTRIC, name: "Energia Elétrica", type: "expense", categoryGroupId: ID.GROUP_UTILITIES, areaId: ID.AREA_FIXED, status: "active", ...stamp },
    { id: ID.CAT_WATER, name: "Água", type: "expense", categoryGroupId: ID.GROUP_UTILITIES, areaId: ID.AREA_FIXED, status: "active", ...stamp },
    { id: ID.CAT_INTERNET, name: "Internet", type: "expense", categoryGroupId: ID.GROUP_UTILITIES, areaId: ID.AREA_FIXED, status: "active", ...stamp },
    { id: ID.CAT_GROCERIES, name: "Supermercado", type: "expense", categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, status: "active", ...stamp },
    { id: ID.CAT_RESTAURANT, name: "Restaurante", type: "expense", categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, status: "active", ...stamp },
    { id: ID.CAT_FUEL, name: "Combustível", type: "expense", categoryGroupId: ID.GROUP_TRANSPORT, areaId: ID.AREA_DAILY, status: "active", ...stamp },
    { id: ID.CAT_UBER, name: "Uber/Táxi", type: "expense", categoryGroupId: ID.GROUP_TRANSPORT, areaId: ID.AREA_DAILY, status: "active", ...stamp },
    { id: ID.CAT_GYM, name: "Academia", type: "expense", categoryGroupId: ID.GROUP_HEALTH, areaId: ID.AREA_PERSONAL, status: "active", ...stamp },
    { id: ID.CAT_PHARMACY, name: "Farmácia", type: "expense", categoryGroupId: ID.GROUP_HEALTH, areaId: ID.AREA_PERSONAL, status: "active", ...stamp },
    { id: ID.CAT_IPTU, name: "IPTU", type: "expense", categoryGroupId: ID.GROUP_TAXES, areaId: ID.AREA_TAXES, status: "active", ...stamp },
  ]

  const contacts = [
    { id: ID.CONTACT_EMPLOYER, name: "Empresa ABC Ltda", type: "customer", status: "active", email: "rh@empresaabc.com.br", ...stamp },
    { id: ID.CONTACT_CLIENT_JOAO, name: "João Silva", type: "customer", status: "active", email: "joao.silva@email.com", ...stamp },
    { id: ID.CONTACT_CLIENT_TECHCORP, name: "TechCorp Sistemas", type: "customer", status: "active", email: "financeiro@techcorp.com.br", ...stamp },
    { id: ID.CONTACT_CLIENT_MARIA, name: "Maria Santos", type: "customer", status: "active", email: "maria.santos@email.com", ...stamp },
    { id: ID.CONTACT_CLIENT_MERCADOLIVRE, name: "Mercado Livre", type: "customer", status: "active", ...stamp },
    { id: ID.CONTACT_LANDLORD, name: "Imobiliária Nova Era", type: "supplier", status: "active", phone: "(11) 3030-4040", ...stamp },
    { id: ID.CONTACT_ENEL, name: "Enel Distribuição", type: "supplier", status: "active", ...stamp },
    { id: ID.CONTACT_SABESP, name: "Sabesp", type: "supplier", status: "active", ...stamp },
    { id: ID.CONTACT_VIVO, name: "Vivo Fibra", type: "supplier", status: "active", ...stamp },
    { id: ID.CONTACT_CARREFOUR, name: "Carrefour", type: "supplier", status: "active", ...stamp },
  ]

  const openingDate = (() => {
    const today = new Date()
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 6, 1))
    return d.toISOString().split("T")[0]!
  })()

  const accounts = [
    { id: ID.ACC_BB_CORRENTE, name: "BB Corrente", institutionName: "Banco do Brasil", type: "checking", status: "active", currency: "BRL", openingBalance: 2450.0, openingBalanceDate: openingDate, icon: "wallet", color: "#FBBF24", isBusiness: false, ...stamp },
    { id: ID.ACC_MP_CORRENTE, name: "Mercado Pago", institutionName: "Mercado Pago", type: "checking", status: "active", currency: "BRL", openingBalance: 580.0, openingBalanceDate: openingDate, icon: "wallet", color: "#06B6D4", isBusiness: false, ...stamp },
    { id: ID.ACC_BB_INVEST, name: "BB Investimento", institutionName: "Banco do Brasil", type: "investment", status: "active", currency: "BRL", openingBalance: 12300.0, openingBalanceDate: openingDate, icon: "trending-up", color: "#10B981", isBusiness: false, ...stamp },
    { id: ID.ACC_BB_CNPJ, name: "BB Empresa", institutionName: "Banco do Brasil", type: "business", status: "active", currency: "BRL", openingBalance: 4200.0, openingBalanceDate: openingDate, icon: "building-2", color: "#6366F1", isBusiness: true, ...stamp },
    { id: ID.ACC_BB_CC, name: "Cartão BB", institutionName: "Banco do Brasil", type: "credit-card", status: "active", currency: "BRL", openingBalance: -850.0, openingBalanceDate: openingDate, icon: "credit-card", color: "#FBBF24", isBusiness: false, creditLimit: 5000.0, closingDay: 5, dueDay: 12, ...stamp },
    { id: ID.ACC_NUBANK_CC, name: "Cartão Nubank", institutionName: "Nubank", type: "credit-card", status: "active", currency: "BRL", openingBalance: -1240.0, openingBalanceDate: openingDate, icon: "credit-card", color: "#8B5CF6", isBusiness: false, creditLimit: 8000.0, closingDay: 18, dueDay: 25, ...stamp },
    { id: ID.ACC_MP_CC, name: "Cartão Mercado Pago", institutionName: "Mercado Pago", type: "credit-card", status: "active", currency: "BRL", openingBalance: -380.0, openingBalanceDate: openingDate, icon: "credit-card", color: "#06B6D4", isBusiness: false, creditLimit: 3000.0, closingDay: 10, dueDay: 17, ...stamp },
  ]

  return {
    mmx_areas: areas,
    mmx_category_groups: categoryGroups,
    mmx_categories: categories,
    mmx_transactions: transactions,
    mmx_contacts: contacts,
    mmx_accounts: accounts,
  }
}
