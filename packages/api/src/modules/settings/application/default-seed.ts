import type { SeedData } from "../domain/settings.types"

const ID = {
  // Areas
  AREA_INCOME: "seed_area_income",
  AREA_FIXED: "seed_area_fixed",
  AREA_DAILY: "seed_area_daily",
  AREA_PERSONAL: "seed_area_personal",
  AREA_TAXES: "seed_area_taxes",
  // Groups
  GROUP_SALARY: "seed_group_salary",
  GROUP_EXTRA: "seed_group_extra",
  GROUP_HOUSING: "seed_group_housing",
  GROUP_UTILITIES: "seed_group_utilities",
  GROUP_FOOD: "seed_group_food",
  GROUP_TRANSPORT: "seed_group_transport",
  GROUP_HEALTH: "seed_group_health",
  GROUP_TAXES: "seed_group_taxes",
  // Categories
  CAT_SALARY: "seed_cat_salary",
  CAT_FREELANCE: "seed_cat_freelance",
  CAT_RENT: "seed_cat_rent",
  CAT_ELECTRIC: "seed_cat_electric",
  CAT_WATER: "seed_cat_water",
  CAT_INTERNET: "seed_cat_internet",
  CAT_GROCERIES: "seed_cat_groceries",
  CAT_RESTAURANT: "seed_cat_restaurant",
  CAT_FUEL: "seed_cat_fuel",
  CAT_UBER: "seed_cat_uber",
  CAT_GYM: "seed_cat_gym",
  CAT_PHARMACY: "seed_cat_pharmacy",
  CAT_IPTU: "seed_cat_iptu",
  // Contacts
  CONTACT_EMPLOYER: "seed_contact_employer",
  CONTACT_CLIENT_JOAO: "seed_contact_client_joao",
  CONTACT_CLIENT_TECHCORP: "seed_contact_client_techcorp",
  CONTACT_CLIENT_MARIA: "seed_contact_client_maria",
  CONTACT_CLIENT_MERCADOLIVRE: "seed_contact_client_mercadolivre",
  CONTACT_LANDLORD: "seed_contact_landlord",
  CONTACT_ENEL: "seed_contact_enel",
  CONTACT_SABESP: "seed_contact_sabesp",
  CONTACT_VIVO: "seed_contact_vivo",
  CONTACT_CARREFOUR: "seed_contact_carrefour",
} as const

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
  description: string
  amount: number
  type: "INCOME" | "EXPENSE"
  categoryId: string
  categoryGroupId: string
  areaId: string
  contactId: string | null
  date: string
  status: "PENDING" | "COMPLETED" | "CANCELLED"
  notes: string | null
}

function buildMonth(offsetMonths: number): SeedTransaction[] {
  const monthLabel = `m${offsetMonths}`
  const isCurrentMonth = offsetMonths === 0
  const completed = "COMPLETED"
  const pending = "PENDING"
  const today = new Date()
  const todayDay = today.getUTCDate()

  const statusForDay = (day: number): "PENDING" | "COMPLETED" =>
    isCurrentMonth && day > todayDay ? pending : completed

  const txs: SeedTransaction[] = [
    {
      id: `seed_tx_${monthLabel}_salary`,
      description: "Salário mensal",
      amount: 5500,
      type: "INCOME",
      categoryId: ID.CAT_SALARY,
      categoryGroupId: ID.GROUP_SALARY,
      areaId: ID.AREA_INCOME,
      contactId: ID.CONTACT_EMPLOYER,
      date: dateAt(offsetMonths, 5),
      status: statusForDay(5),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_rent`,
      description: "Aluguel",
      amount: 1800,
      type: "EXPENSE",
      categoryId: ID.CAT_RENT,
      categoryGroupId: ID.GROUP_HOUSING,
      areaId: ID.AREA_FIXED,
      contactId: ID.CONTACT_LANDLORD,
      date: dateAt(offsetMonths, 10),
      status: statusForDay(10),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_electric`,
      description: "Conta de luz",
      amount: 215.4,
      type: "EXPENSE",
      categoryId: ID.CAT_ELECTRIC,
      categoryGroupId: ID.GROUP_UTILITIES,
      areaId: ID.AREA_FIXED,
      contactId: ID.CONTACT_ENEL,
      date: dateAt(offsetMonths, 15),
      status: statusForDay(15),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_water`,
      description: "Conta de água",
      amount: 84.9,
      type: "EXPENSE",
      categoryId: ID.CAT_WATER,
      categoryGroupId: ID.GROUP_UTILITIES,
      areaId: ID.AREA_FIXED,
      contactId: ID.CONTACT_SABESP,
      date: dateAt(offsetMonths, 18),
      status: statusForDay(18),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_internet`,
      description: "Internet fibra",
      amount: 99.9,
      type: "EXPENSE",
      categoryId: ID.CAT_INTERNET,
      categoryGroupId: ID.GROUP_UTILITIES,
      areaId: ID.AREA_FIXED,
      contactId: ID.CONTACT_VIVO,
      date: dateAt(offsetMonths, 12),
      status: statusForDay(12),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_groc1`,
      description: "Compras semana 1",
      amount: 387.55,
      type: "EXPENSE",
      categoryId: ID.CAT_GROCERIES,
      categoryGroupId: ID.GROUP_FOOD,
      areaId: ID.AREA_DAILY,
      contactId: ID.CONTACT_CARREFOUR,
      date: dateAt(offsetMonths, 3),
      status: statusForDay(3),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_groc2`,
      description: "Compras semana 2",
      amount: 412.3,
      type: "EXPENSE",
      categoryId: ID.CAT_GROCERIES,
      categoryGroupId: ID.GROUP_FOOD,
      areaId: ID.AREA_DAILY,
      contactId: ID.CONTACT_CARREFOUR,
      date: dateAt(offsetMonths, 11),
      status: statusForDay(11),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_groc3`,
      description: "Compras semana 3",
      amount: 354.8,
      type: "EXPENSE",
      categoryId: ID.CAT_GROCERIES,
      categoryGroupId: ID.GROUP_FOOD,
      areaId: ID.AREA_DAILY,
      contactId: ID.CONTACT_CARREFOUR,
      date: dateAt(offsetMonths, 18),
      status: statusForDay(18),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_groc4`,
      description: "Compras semana 4",
      amount: 421.05,
      type: "EXPENSE",
      categoryId: ID.CAT_GROCERIES,
      categoryGroupId: ID.GROUP_FOOD,
      areaId: ID.AREA_DAILY,
      contactId: ID.CONTACT_CARREFOUR,
      date: dateAt(offsetMonths, 26),
      status: statusForDay(26),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_rest1`,
      description: "Almoço executivo",
      amount: 58.5,
      type: "EXPENSE",
      categoryId: ID.CAT_RESTAURANT,
      categoryGroupId: ID.GROUP_FOOD,
      areaId: ID.AREA_DAILY,
      contactId: null,
      date: dateAt(offsetMonths, 5),
      status: statusForDay(5),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_rest2`,
      description: "Jantar com amigos",
      amount: 142.9,
      type: "EXPENSE",
      categoryId: ID.CAT_RESTAURANT,
      categoryGroupId: ID.GROUP_FOOD,
      areaId: ID.AREA_DAILY,
      contactId: null,
      date: dateAt(offsetMonths, 9),
      status: statusForDay(9),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_rest3`,
      description: "Lanche rápido",
      amount: 32.0,
      type: "EXPENSE",
      categoryId: ID.CAT_RESTAURANT,
      categoryGroupId: ID.GROUP_FOOD,
      areaId: ID.AREA_DAILY,
      contactId: null,
      date: dateAt(offsetMonths, 14),
      status: statusForDay(14),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_rest4`,
      description: "Pizza fim de semana",
      amount: 86.4,
      type: "EXPENSE",
      categoryId: ID.CAT_RESTAURANT,
      categoryGroupId: ID.GROUP_FOOD,
      areaId: ID.AREA_DAILY,
      contactId: null,
      date: dateAt(offsetMonths, 20),
      status: statusForDay(20),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_rest5`,
      description: "Cafeteria",
      amount: 24.5,
      type: "EXPENSE",
      categoryId: ID.CAT_RESTAURANT,
      categoryGroupId: ID.GROUP_FOOD,
      areaId: ID.AREA_DAILY,
      contactId: null,
      date: dateAt(offsetMonths, 27),
      status: statusForDay(27),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_fuel1`,
      description: "Abastecimento",
      amount: 245.0,
      type: "EXPENSE",
      categoryId: ID.CAT_FUEL,
      categoryGroupId: ID.GROUP_TRANSPORT,
      areaId: ID.AREA_DAILY,
      contactId: null,
      date: dateAt(offsetMonths, 4),
      status: statusForDay(4),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_fuel2`,
      description: "Abastecimento",
      amount: 230.0,
      type: "EXPENSE",
      categoryId: ID.CAT_FUEL,
      categoryGroupId: ID.GROUP_TRANSPORT,
      areaId: ID.AREA_DAILY,
      contactId: null,
      date: dateAt(offsetMonths, 12),
      status: statusForDay(12),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_fuel3`,
      description: "Abastecimento",
      amount: 260.5,
      type: "EXPENSE",
      categoryId: ID.CAT_FUEL,
      categoryGroupId: ID.GROUP_TRANSPORT,
      areaId: ID.AREA_DAILY,
      contactId: null,
      date: dateAt(offsetMonths, 20),
      status: statusForDay(20),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_fuel4`,
      description: "Abastecimento",
      amount: 235.0,
      type: "EXPENSE",
      categoryId: ID.CAT_FUEL,
      categoryGroupId: ID.GROUP_TRANSPORT,
      areaId: ID.AREA_DAILY,
      contactId: null,
      date: dateAt(offsetMonths, 28),
      status: statusForDay(28),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_uber1`,
      description: "Corrida Uber",
      amount: 38.9,
      type: "EXPENSE",
      categoryId: ID.CAT_UBER,
      categoryGroupId: ID.GROUP_TRANSPORT,
      areaId: ID.AREA_DAILY,
      contactId: null,
      date: dateAt(offsetMonths, 8),
      status: statusForDay(8),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_uber2`,
      description: "Corrida Uber",
      amount: 52.3,
      type: "EXPENSE",
      categoryId: ID.CAT_UBER,
      categoryGroupId: ID.GROUP_TRANSPORT,
      areaId: ID.AREA_DAILY,
      contactId: null,
      date: dateAt(offsetMonths, 22),
      status: statusForDay(22),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_gym`,
      description: "Mensalidade academia",
      amount: 119.9,
      type: "EXPENSE",
      categoryId: ID.CAT_GYM,
      categoryGroupId: ID.GROUP_HEALTH,
      areaId: ID.AREA_PERSONAL,
      contactId: null,
      date: dateAt(offsetMonths, 5),
      status: statusForDay(5),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_pharm1`,
      description: "Farmácia",
      amount: 87.4,
      type: "EXPENSE",
      categoryId: ID.CAT_PHARMACY,
      categoryGroupId: ID.GROUP_HEALTH,
      areaId: ID.AREA_PERSONAL,
      contactId: null,
      date: dateAt(offsetMonths, 10),
      status: statusForDay(10),
      notes: null,
    },
    {
      id: `seed_tx_${monthLabel}_pharm2`,
      description: "Farmácia",
      amount: 142.0,
      type: "EXPENSE",
      categoryId: ID.CAT_PHARMACY,
      categoryGroupId: ID.GROUP_HEALTH,
      areaId: ID.AREA_PERSONAL,
      contactId: null,
      date: dateAt(offsetMonths, 25),
      status: statusForDay(25),
      notes: null,
    },
  ]

  if (offsetMonths === 1 || offsetMonths === 0) {
    txs.push({
      id: `seed_tx_${monthLabel}_freelance`,
      description: "Projeto freelance — landing page",
      amount: 1800,
      type: "INCOME",
      categoryId: ID.CAT_FREELANCE,
      categoryGroupId: ID.GROUP_EXTRA,
      areaId: ID.AREA_INCOME,
      contactId: ID.CONTACT_CLIENT_TECHCORP,
      date: dateAt(offsetMonths, 22),
      status: statusForDay(22),
      notes: null,
    })
  }

  if (offsetMonths === 2) {
    txs.push({
      id: `seed_tx_${monthLabel}_iptu`,
      description: "IPTU 2026 — parcela",
      amount: 287.0,
      type: "EXPENSE",
      categoryId: ID.CAT_IPTU,
      categoryGroupId: ID.GROUP_TAXES,
      areaId: ID.AREA_TAXES,
      contactId: null,
      date: dateAt(offsetMonths, 15),
      status: statusForDay(15),
      notes: "Pagamento mensal do IPTU",
    })
  }

  return txs
}

export function getDefaultSeed(): SeedData {
  const transactions = [...buildMonth(2), ...buildMonth(1), ...buildMonth(0)]

  const areas = [
    {
      id: ID.AREA_INCOME,
      name: "Recebimentos",
      type: "INCOME",
      color: "#10B981",
      icon: "TrendingUp",
      status: "ACTIVE",
      description: "Receitas e ganhos",
    },
    {
      id: ID.AREA_FIXED,
      name: "Despesas Fixas",
      type: "FIXED_EXPENSES",
      color: "#3B82F6",
      icon: "Home",
      status: "ACTIVE",
      description: "Aluguel, contas e mensalidades",
    },
    {
      id: ID.AREA_DAILY,
      name: "Despesas Variáveis",
      type: "DAILY_EXPENSES",
      color: "#F59E0B",
      icon: "ShoppingCart",
      status: "ACTIVE",
      description: "Mercado, transporte e lazer",
    },
    {
      id: ID.AREA_PERSONAL,
      name: "Pessoais",
      type: "PERSONAL",
      color: "#EC4899",
      icon: "Heart",
      status: "ACTIVE",
      description: "Saúde, educação e bem-estar",
    },
    {
      id: ID.AREA_TAXES,
      name: "Encargos & Taxas",
      type: "TAXES_FEES",
      color: "#64748B",
      icon: "Receipt",
      status: "ACTIVE",
      description: "Impostos, tarifas e taxas",
    },
  ]

  const categoryGroups = [
    { id: ID.GROUP_SALARY, name: "Salários", areaId: ID.AREA_INCOME, color: "#10B981", icon: "Briefcase", status: "ACTIVE" },
    { id: ID.GROUP_EXTRA, name: "Renda Extra", areaId: ID.AREA_INCOME, color: "#059669", icon: "PlusCircle", status: "ACTIVE" },
    { id: ID.GROUP_HOUSING, name: "Moradia", areaId: ID.AREA_FIXED, color: "#3B82F6", icon: "Home", status: "ACTIVE" },
    { id: ID.GROUP_UTILITIES, name: "Contas Fixas", areaId: ID.AREA_FIXED, color: "#2563EB", icon: "Zap", status: "ACTIVE" },
    { id: ID.GROUP_FOOD, name: "Alimentação", areaId: ID.AREA_DAILY, color: "#F59E0B", icon: "ShoppingCart", status: "ACTIVE" },
    { id: ID.GROUP_TRANSPORT, name: "Transporte", areaId: ID.AREA_DAILY, color: "#8B5CF6", icon: "Car", status: "ACTIVE" },
    { id: ID.GROUP_HEALTH, name: "Saúde & Bem-estar", areaId: ID.AREA_PERSONAL, color: "#EC4899", icon: "Heart", status: "ACTIVE" },
    { id: ID.GROUP_TAXES, name: "Impostos", areaId: ID.AREA_TAXES, color: "#64748B", icon: "Receipt", status: "ACTIVE" },
  ]

  const categories = [
    { id: ID.CAT_SALARY, name: "Salário", type: "INCOME", categoryGroupId: ID.GROUP_SALARY, areaId: ID.AREA_INCOME, status: "ACTIVE" },
    { id: ID.CAT_FREELANCE, name: "Freelance", type: "INCOME", categoryGroupId: ID.GROUP_EXTRA, areaId: ID.AREA_INCOME, status: "ACTIVE" },
    { id: ID.CAT_RENT, name: "Aluguel", type: "EXPENSE", categoryGroupId: ID.GROUP_HOUSING, areaId: ID.AREA_FIXED, status: "ACTIVE" },
    { id: ID.CAT_ELECTRIC, name: "Energia Elétrica", type: "EXPENSE", categoryGroupId: ID.GROUP_UTILITIES, areaId: ID.AREA_FIXED, status: "ACTIVE" },
    { id: ID.CAT_WATER, name: "Água", type: "EXPENSE", categoryGroupId: ID.GROUP_UTILITIES, areaId: ID.AREA_FIXED, status: "ACTIVE" },
    { id: ID.CAT_INTERNET, name: "Internet", type: "EXPENSE", categoryGroupId: ID.GROUP_UTILITIES, areaId: ID.AREA_FIXED, status: "ACTIVE" },
    { id: ID.CAT_GROCERIES, name: "Supermercado", type: "EXPENSE", categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, status: "ACTIVE" },
    { id: ID.CAT_RESTAURANT, name: "Restaurante", type: "EXPENSE", categoryGroupId: ID.GROUP_FOOD, areaId: ID.AREA_DAILY, status: "ACTIVE" },
    { id: ID.CAT_FUEL, name: "Combustível", type: "EXPENSE", categoryGroupId: ID.GROUP_TRANSPORT, areaId: ID.AREA_DAILY, status: "ACTIVE" },
    { id: ID.CAT_UBER, name: "Uber/Táxi", type: "EXPENSE", categoryGroupId: ID.GROUP_TRANSPORT, areaId: ID.AREA_DAILY, status: "ACTIVE" },
    { id: ID.CAT_GYM, name: "Academia", type: "EXPENSE", categoryGroupId: ID.GROUP_HEALTH, areaId: ID.AREA_PERSONAL, status: "ACTIVE" },
    { id: ID.CAT_PHARMACY, name: "Farmácia", type: "EXPENSE", categoryGroupId: ID.GROUP_HEALTH, areaId: ID.AREA_PERSONAL, status: "ACTIVE" },
    { id: ID.CAT_IPTU, name: "IPTU", type: "EXPENSE", categoryGroupId: ID.GROUP_TAXES, areaId: ID.AREA_TAXES, status: "ACTIVE" },
  ]

  const contacts = [
    { id: ID.CONTACT_EMPLOYER, name: "Empresa ABC Ltda", type: "CUSTOMER", status: "ACTIVE", email: "rh@empresaabc.com.br" },
    { id: ID.CONTACT_CLIENT_JOAO, name: "João Silva", type: "CUSTOMER", status: "ACTIVE", email: "joao.silva@email.com" },
    { id: ID.CONTACT_CLIENT_TECHCORP, name: "TechCorp Sistemas", type: "CUSTOMER", status: "ACTIVE", email: "financeiro@techcorp.com.br" },
    { id: ID.CONTACT_CLIENT_MARIA, name: "Maria Santos", type: "CUSTOMER", status: "ACTIVE", email: "maria.santos@email.com" },
    { id: ID.CONTACT_CLIENT_MERCADOLIVRE, name: "Mercado Livre", type: "CUSTOMER", status: "ACTIVE" },
    { id: ID.CONTACT_LANDLORD, name: "Imobiliária Nova Era", type: "SUPPLIER", status: "ACTIVE", phone: "(11) 3030-4040" },
    { id: ID.CONTACT_ENEL, name: "Enel Distribuição", type: "SUPPLIER", status: "ACTIVE" },
    { id: ID.CONTACT_SABESP, name: "Sabesp", type: "SUPPLIER", status: "ACTIVE" },
    { id: ID.CONTACT_VIVO, name: "Vivo Fibra", type: "SUPPLIER", status: "ACTIVE" },
    { id: ID.CONTACT_CARREFOUR, name: "Carrefour", type: "SUPPLIER", status: "ACTIVE" },
  ]

  return {
    mmx_areas: areas,
    mmx_category_groups: categoryGroups,
    mmx_categories: categories,
    mmx_transactions: transactions,
    mmx_contacts: contacts,
  }
}
