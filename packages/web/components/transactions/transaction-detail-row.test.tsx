/** @vitest-environment jsdom */

import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { TransactionDetailRow } from "./transaction-detail-row"
import type { Transaction, Category, CategoryGroup, Area, Contact, RecurringTemplate } from "@/lib/shared/types"

const today = new Date()
const futureDate1 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
const futureDate2 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)

const category: Category = {
  id: "cat_1",
  name: "Restaurante",
  type: "expense",
  status: "active",
  categoryGroupId: "cg_1",
  areaId: "area_1",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
}

const categoryGroup: CategoryGroup = {
  id: "cg_1",
  name: "Alimentação",
  color: "#f00",
  icon: "Utensils",
  status: "active",
  areaId: "area_1",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
}

const area: Area = {
  id: "area_1",
  name: "Despesas Variáveis",
  type: "dailyExpenses",
  color: "#0f0",
  icon: "ShoppingCart",
  status: "active",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
}

const contact: Contact = {
  id: "contact_1",
  name: "Empresa ABC Ltda",
  type: "supplier",
  status: "active",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
}

function makeTemplate(overrides: Partial<RecurringTemplate> = {}): RecurringTemplate {
  return {
    id: "tpl_1",
    frequency: "monthly",
    interval: 1,
    daysOfWeek: [],
    dayOfMonth: null,
    weekOfMonth: null,
    monthOfYear: null,
    monthlyMode: null,
    count: 12,
    startDate: "2026-05-01",
    endDate: null,
    paused: false,
    pausedAt: null,
    templateAmount: 100,
    templateDescription: "Aluguel",
    templateNotes: null,
    templateType: "expense",
    templateCategoryId: "cat_1",
    templateContactId: null,
    templateAreaId: "area_1",
    templateCategoryGroupId: "cg_1",
    createdAt: "2026-04-01",
    updatedAt: "2026-04-01",
    ...overrides,
  }
}

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "tx_1",
    description: "Aluguel",
    amount: 100,
    type: "expense",
    categoryId: "cat_1",
    contactId: "contact_1",
    areaId: "area_1",
    categoryGroupId: "cg_1",
    accountId: "acc_1",
    date: today.toISOString().split("T")[0]!,
    status: "pending",
    skipped: false,
    isException: false,
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
    ...overrides,
  }
}

describe("TransactionDetailRow", () => {
  afterEach(() => cleanup())

  it("transação avulsa (sem série): NÃO renderiza bloco de série", () => {
    const tx = makeTx({ templateId: null })
    render(
      <TransactionDetailRow
        transaction={tx}
        allTransactions={[tx]}
        categories={[category]}
        categoryGroups={[categoryGroup]}
        areas={[area]}
        contacts={[contact]}
      />,
    )

    expect(screen.queryByText(/Série recorrente|Série pausada/i)).toBeNull()
    expect(screen.queryByText(/de \d+ Mensal/i)).toBeNull()
  })

  it("renderiza hierarquia Área › Grupo › Categoria", () => {
    const tx = makeTx()
    render(
      <TransactionDetailRow
        transaction={tx}
        allTransactions={[tx]}
        categories={[category]}
        categoryGroups={[categoryGroup]}
        areas={[area]}
        contacts={[contact]}
      />,
    )

    expect(screen.getByText(/Despesas Variáveis/)).toBeTruthy()
    expect(screen.getByText(/Alimentação/)).toBeTruthy()
    expect(screen.getByText(/Restaurante/)).toBeTruthy()
  })

  it("mostra nome do contato quando contactId presente", () => {
    const tx = makeTx({ contactId: "contact_1" })
    render(
      <TransactionDetailRow
        transaction={tx}
        allTransactions={[tx]}
        categories={[category]}
        categoryGroups={[categoryGroup]}
        areas={[area]}
        contacts={[contact]}
      />,
    )
    expect(screen.getByText("Empresa ABC Ltda")).toBeTruthy()
  })

  it("mostra 'Sem contato' quando contactId vazio", () => {
    const tx = makeTx({ contactId: undefined })
    render(
      <TransactionDetailRow
        transaction={tx}
        allTransactions={[tx]}
        categories={[category]}
        categoryGroups={[categoryGroup]}
        areas={[area]}
        contacts={[contact]}
      />,
    )
    expect(screen.getByText(/Sem contato/i)).toBeTruthy()
  })

  it("mostra notas quando presentes", () => {
    const tx = makeTx({ notes: "Pago em dinheiro vivo" })
    render(
      <TransactionDetailRow
        transaction={tx}
        allTransactions={[tx]}
        categories={[category]}
        categoryGroups={[categoryGroup]}
        areas={[area]}
        contacts={[contact]}
      />,
    )
    expect(screen.getByText("Pago em dinheiro vivo")).toBeTruthy()
  })

  it("série ativa: mostra 'Série recorrente' + label X de Y Mensal", () => {
    const template = makeTemplate({ count: 12 })
    const tx = makeTx({ templateId: "tpl_1", template, seriesIndex: 3 })
    render(
      <TransactionDetailRow
        transaction={tx}
        allTransactions={[tx]}
        categories={[category]}
        categoryGroups={[categoryGroup]}
        areas={[area]}
        contacts={[contact]}
      />,
    )
    expect(screen.getByText(/Série recorrente/i)).toBeTruthy()
    expect(screen.getByText(/3 de 12 Mensal/i)).toBeTruthy()
  })

  it("série pausada: mostra 'Série pausada' (não 'recorrente')", () => {
    const template = makeTemplate({ paused: true })
    const tx = makeTx({ templateId: "tpl_1", template, seriesIndex: 3 })
    render(
      <TransactionDetailRow
        transaction={tx}
        allTransactions={[tx]}
        categories={[category]}
        categoryGroups={[categoryGroup]}
        areas={[area]}
        contacts={[contact]}
      />,
    )
    expect(screen.getByText(/Série pausada/i)).toBeTruthy()
    expect(screen.queryByText(/Série recorrente/i)).toBeNull()
  })

  it("transação isException: mostra badge 'Exceção'", () => {
    const tx = makeTx({ templateId: "tpl_1", template: makeTemplate(), isException: true })
    render(
      <TransactionDetailRow
        transaction={tx}
        allTransactions={[tx]}
        categories={[category]}
        categoryGroups={[categoryGroup]}
        areas={[area]}
        contacts={[contact]}
      />,
    )
    expect(screen.getByText(/Exceção/i)).toBeTruthy()
  })

  it("transação skipped: mostra badge 'Pulada'", () => {
    const tx = makeTx({ templateId: "tpl_1", template: makeTemplate(), skipped: true })
    render(
      <TransactionDetailRow
        transaction={tx}
        allTransactions={[tx]}
        categories={[category]}
        categoryGroups={[categoryGroup]}
        areas={[area]}
        contacts={[contact]}
      />,
    )
    expect(screen.getByText(/Pulada/i)).toBeTruthy()
  })

  it("lista até 3 próximas ocorrências futuras (ignora skipped e passadas)", () => {
    const template = makeTemplate()
    const current = makeTx({ id: "tx_curr", templateId: "tpl_1", template })
    const next1 = makeTx({
      id: "tx_n1",
      templateId: "tpl_1",
      date: futureDate1.toISOString().split("T")[0]!,
      amount: 200,
      skipped: false,
    })
    const next2 = makeTx({
      id: "tx_n2",
      templateId: "tpl_1",
      date: futureDate2.toISOString().split("T")[0]!,
      amount: 300,
      skipped: false,
    })
    const skippedNext = makeTx({
      id: "tx_skip",
      templateId: "tpl_1",
      date: futureDate1.toISOString().split("T")[0]!,
      amount: 999,
      skipped: true,
    })

    render(
      <TransactionDetailRow
        transaction={current}
        allTransactions={[current, next1, next2, skippedNext]}
        categories={[category]}
        categoryGroups={[categoryGroup]}
        areas={[area]}
        contacts={[contact]}
      />,
    )

    // Próximas devem aparecer
    const upcoming = screen.getByText(/Próximas:/i).textContent ?? ""
    expect(upcoming).toMatch(/200,00/)
    expect(upcoming).toMatch(/300,00/)
    // Skipped não deve aparecer
    expect(upcoming).not.toMatch(/999/)
  })
})
