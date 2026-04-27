import { describe, expect, it, vi } from "vitest"
import { BelvoProviderAdapter, mapAccount, mapBill, mapOwner, mapTransaction } from "./belvo-provider.adapter"
import { BelvoHttpClient } from "./belvo-http.client"

// Synthetic fixtures based on Open Finance Brasil + Belvo public docs.
// Refine to real values when the first sandbox payload is captured.

const ACCOUNT_FIXTURE = {
  id: "0fa4f1c2-7e8b-4a01-9d8a-aaaaaaaaaaaa",
  link: "11111111-2222-3333-4444-555555555555",
  name: "Cartão de Crédito Castler",
  type: "CREDIT_CARD",
  category: "CREDIT_ACCOUNT",
  currency: "BRL",
  balance: { current: -1234.56, available: 8765.44 },
}

const TRANSACTION_FIXTURE = {
  id: "tx-001",
  account: { id: "0fa4f1c2-7e8b-4a01-9d8a-aaaaaaaaaaaa" },
  amount: -89.9,
  currency: "BRL",
  value_date: "2026-04-15",
  description: "Padaria do Bairro",
  observations: "12 PARCELA",
  merchant: { name: "PADARIA DO BAIRRO LTDA" },
  category: "Alimentação",
  type: "OUTFLOW",
}

const BILL_FIXTURE = {
  id: "bill-001",
  account: { id: "0fa4f1c2-7e8b-4a01-9d8a-aaaaaaaaaaaa" },
  bill_amount: 4321.0,
  currency: "BRL",
  billing_date: "2026-04-15",
  due_date: "2026-04-25",
  status: "OPEN",
}

const OWNER_FIXTURE = {
  display_name: "Paulilio Ferreira",
  email: "paulilio@castlerdigital.com.br",
  phone_number: "+5541999998888",
  document: { document_id: "76109277673", document_type: "CPF" },
}

describe("belvo-provider adapter", () => {
  it("mapAccount preserva campos críticos e desnorma balance", () => {
    const mapped = mapAccount(ACCOUNT_FIXTURE)
    expect(mapped.externalId).toBe(ACCOUNT_FIXTURE.id)
    expect(mapped.name).toBe(ACCOUNT_FIXTURE.name)
    expect(mapped.balanceCurrent).toBe(-1234.56)
    expect(mapped.balanceAvailable).toBe(8765.44)
  })

  it("mapAccount tolera balance ausente", () => {
    const mapped = mapAccount({ ...ACCOUNT_FIXTURE, balance: null })
    expect(mapped.balanceCurrent).toBeUndefined()
    expect(mapped.balanceAvailable).toBeUndefined()
  })

  it("mapTransaction concatena description + observations e usa value_date", () => {
    const mapped = mapTransaction(TRANSACTION_FIXTURE)
    expect(mapped.externalId).toBe("tx-001")
    expect(mapped.description).toBe("Padaria do Bairro — 12 PARCELA")
    expect(mapped.merchantName).toBe("PADARIA DO BAIRRO LTDA")
    expect(mapped.amount).toBe(-89.9)
    expect(mapped.occurredAt.toISOString().startsWith("2026-04-15")).toBe(true)
    expect(mapped.type).toBe("OUTFLOW")
  })

  it("mapTransaction usa accounting_date como fallback se value_date ausente", () => {
    const raw = { ...TRANSACTION_FIXTURE, value_date: undefined, accounting_date: "2026-04-10" }
    const mapped = mapTransaction(raw)
    expect(mapped.occurredAt.toISOString().startsWith("2026-04-10")).toBe(true)
  })

  it("mapTransaction lança erro quando ambos value_date e accounting_date estão ausentes", () => {
    const raw = { ...TRANSACTION_FIXTURE, value_date: undefined }
    expect(() => mapTransaction(raw)).toThrow(/value_date|accounting_date/)
  })

  it("mapBill mapeia bill_amount, billing_date e due_date", () => {
    const mapped = mapBill(BILL_FIXTURE)
    expect(mapped.externalId).toBe("bill-001")
    expect(mapped.amount).toBe(4321.0)
    expect(mapped.billingDate.toISOString().startsWith("2026-04-15")).toBe(true)
    expect(mapped.dueDate.toISOString().startsWith("2026-04-25")).toBe(true)
    expect(mapped.status).toBe("OPEN")
  })

  it("mapBill lança erro se faltar bill_amount", () => {
    expect(() => mapBill({ ...BILL_FIXTURE, bill_amount: undefined })).toThrow(/bill_amount/)
  })

  it("mapOwner extrai documento e contato", () => {
    const mapped = mapOwner(OWNER_FIXTURE)
    expect(mapped.displayName).toBe("Paulilio Ferreira")
    expect(mapped.documentId).toBe("76109277673")
    expect(mapped.documentType).toBe("CPF")
  })

  it("mapOwner usa fallback para nome ausente", () => {
    const mapped = mapOwner({ ...OWNER_FIXTURE, display_name: undefined })
    expect(mapped.displayName).toBe("(sem nome)")
  })

  it("createWidgetToken inclui identification_info quando cpf+fullName presentes", async () => {
    let capturedBody: Record<string, unknown> | null = null
    const fetchMock = vi.fn(async (_url: unknown, init?: RequestInit) => {
      capturedBody = init?.body ? JSON.parse(init.body as string) : null
      return new Response(
        JSON.stringify({ access: "a", refresh: "r", expires_in: 1200 }),
        { status: 200 },
      )
    })
    const http = new BelvoHttpClient({
      host: "https://sandbox.belvo.com",
      secretId: "id",
      secretPassword: "pwd",
      fetchImpl: fetchMock as unknown as typeof fetch,
    })
    const adapter = new BelvoProviderAdapter(http, "id", "pwd")
    await adapter.createWidgetToken({
      externalUserId: "u1",
      cpf: "761.092.776-73",
      fullName: "Paulilio Ferreira",
    })
    expect(capturedBody).not.toBeNull()
    const widget = (capturedBody as { widget?: { consent?: { identification_info?: unknown[] } } } | null)?.widget
    expect(widget?.consent?.identification_info).toEqual([
      { type: "CPF", number: "76109277673", name: "Paulilio Ferreira" },
    ])
  })

  it("createWidgetToken NÃO inclui identification_info quando cpf inválido (CNPJ)", async () => {
    let capturedBody: Record<string, unknown> | null = null
    const fetchMock = vi.fn(async (_url: unknown, init?: RequestInit) => {
      capturedBody = init?.body ? JSON.parse(init.body as string) : null
      return new Response(
        JSON.stringify({ access: "a", refresh: "r", expires_in: 1200 }),
        { status: 200 },
      )
    })
    const http = new BelvoHttpClient({
      host: "https://sandbox.belvo.com",
      secretId: "id",
      secretPassword: "pwd",
      fetchImpl: fetchMock as unknown as typeof fetch,
    })
    const adapter = new BelvoProviderAdapter(http, "id", "pwd")
    await adapter.createWidgetToken({
      externalUserId: "u1",
      cpf: "63707732000136",
      fullName: "Castler Digital",
    })
    expect(capturedBody).not.toBeNull()
    expect((capturedBody as { widget?: unknown } | null)?.widget).toBeUndefined()
  })

  it("createWidgetToken NÃO inclui identification_info quando fullName ausente", async () => {
    let capturedBody: Record<string, unknown> | null = null
    const fetchMock = vi.fn(async (_url: unknown, init?: RequestInit) => {
      capturedBody = init?.body ? JSON.parse(init.body as string) : null
      return new Response(
        JSON.stringify({ access: "a", refresh: "r", expires_in: 1200 }),
        { status: 200 },
      )
    })
    const http = new BelvoHttpClient({
      host: "https://sandbox.belvo.com",
      secretId: "id",
      secretPassword: "pwd",
      fetchImpl: fetchMock as unknown as typeof fetch,
    })
    const adapter = new BelvoProviderAdapter(http, "id", "pwd")
    await adapter.createWidgetToken({ externalUserId: "u1", cpf: "76109277673" })
    expect((capturedBody as { widget?: unknown } | null)?.widget).toBeUndefined()
  })
})
