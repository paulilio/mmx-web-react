import type {
  FetchBillsOptions,
  FetchTransactionsOptions,
  OpenFinanceProvider,
} from "../../application/ports/open-finance-provider.port"
import type {
  ProviderAccount,
  ProviderBill,
  ProviderLink,
  ProviderOwner,
  ProviderTransaction,
  ProviderWidgetTokenInput,
  ProviderWidgetTokenOutput,
} from "../../domain/open-finance.types"
import { BelvoHttpClient } from "./belvo-http.client"

interface BelvoTokenResponse {
  access: string
  refresh: string
  expires_in?: number
}

interface BelvoLinkResponse {
  id: string
  institution: string
  status: string
  created_at: string
}

interface BelvoAccountResponse {
  id: string
  link: string
  name: string
  type: string
  category: string
  currency: string
  balance?: { current?: number; available?: number } | null
}

interface BelvoTransactionResponse {
  id: string
  account: { id: string }
  amount: number
  currency: string
  value_date?: string
  accounting_date?: string
  description?: string
  observations?: string
  merchant?: { name?: string } | null
  category?: string | null
  type?: string
}

interface BelvoBillResponse {
  id: string
  account: { id: string }
  bill_amount?: number
  currency: string
  billing_date?: string
  due_date?: string
  status?: string
}

interface BelvoOwnerResponse {
  display_name?: string
  email?: string
  phone_number?: string
  document?: { document_id?: string; document_type?: string } | null
}

const DEFAULT_PAGE_SIZE = 100

const TOKEN_SCOPES = "read_institutions,write_links,read_links"

export class BelvoProviderAdapter implements OpenFinanceProvider {
  readonly name = "belvo"

  constructor(
    private readonly http: BelvoHttpClient,
    private readonly secretId: string,
    private readonly secretPassword: string,
  ) {}

  async createWidgetToken(input: ProviderWidgetTokenInput): Promise<ProviderWidgetTokenOutput> {
    const body: Record<string, unknown> = {
      id: this.secretId,
      password: this.secretPassword,
      scopes: TOKEN_SCOPES,
    }

    const cpfDigits = sanitizeCpf(input.cpf)
    if (cpfDigits && input.fullName?.trim()) {
      body.widget = {
        consent: {
          identification_info: [
            { type: "CPF", number: cpfDigits, name: input.fullName.trim() },
          ],
        },
      }
    }

    const res = await this.http.request<BelvoTokenResponse>("POST", "/api/token/", body)
    return {
      accessToken: res.access,
      refreshToken: res.refresh,
      expiresIn: res.expires_in ?? 1200,
    }
  }

  async fetchLink(linkId: string): Promise<ProviderLink> {
    const res = await this.http.request<BelvoLinkResponse>("GET", `/api/links/${linkId}/`)
    return {
      externalId: res.id,
      institutionCode: res.institution,
      status: mapLinkStatus(res.status),
      createdAt: new Date(res.created_at),
    }
  }

  async fetchAccounts(linkId: string): Promise<ProviderAccount[]> {
    const items = await this.http.getAllPages<BelvoAccountResponse>(
      "/api/accounts/",
      `?link=${encodeURIComponent(linkId)}&page_size=${DEFAULT_PAGE_SIZE}`,
    )
    return items.map(mapAccount)
  }

  async fetchTransactions(linkId: string, opts?: FetchTransactionsOptions): Promise<ProviderTransaction[]> {
    const pageSize = opts?.pageSize ?? DEFAULT_PAGE_SIZE
    const since = opts?.since ? `&date_from=${opts.since.toISOString().slice(0, 10)}` : ""
    const items = await this.http.getAllPages<BelvoTransactionResponse>(
      "/api/transactions/",
      `?link=${encodeURIComponent(linkId)}&page_size=${pageSize}${since}`,
    )
    return items.map(mapTransaction)
  }

  async fetchBills(linkId: string, opts?: FetchBillsOptions): Promise<ProviderBill[]> {
    const pageSize = opts?.pageSize ?? DEFAULT_PAGE_SIZE
    const items = await this.http.getAllPages<BelvoBillResponse>(
      "/api/bills/",
      `?link=${encodeURIComponent(linkId)}&page_size=${pageSize}`,
    )
    return items.map(mapBill)
  }

  async fetchOwners(linkId: string): Promise<ProviderOwner[]> {
    const items = await this.http.getAllPages<BelvoOwnerResponse>(
      "/api/owners/",
      `?link=${encodeURIComponent(linkId)}&page_size=${DEFAULT_PAGE_SIZE}`,
    )
    return items.map(mapOwner)
  }

  async revokeLink(linkId: string): Promise<void> {
    await this.http.request<unknown>("DELETE", `/api/links/${linkId}/`)
  }
}

function sanitizeCpf(value: string | undefined): string | null {
  if (!value) return null
  const digits = value.replace(/\D/g, "")
  return digits.length === 11 ? digits : null
}

function mapLinkStatus(status: string): ProviderLink["status"] {
  const normalized = status.toLowerCase()
  if (normalized === "valid") return "valid"
  if (normalized === "invalid") return "invalid"
  if (normalized === "expired") return "expired"
  if (normalized === "revoked") return "revoked"
  return "invalid"
}

export function mapAccount(raw: BelvoAccountResponse): ProviderAccount {
  return {
    externalId: raw.id,
    name: raw.name,
    type: raw.type,
    category: raw.category,
    currency: raw.currency,
    balanceCurrent: raw.balance?.current,
    balanceAvailable: raw.balance?.available,
  }
}

export function mapTransaction(raw: BelvoTransactionResponse): ProviderTransaction {
  const occurredAtRaw = raw.value_date ?? raw.accounting_date
  if (!occurredAtRaw) throw new Error(`Belvo transaction ${raw.id} sem value_date/accounting_date`)
  const description = [raw.description, raw.observations].filter(Boolean).join(" — ").trim() || raw.id
  return {
    externalId: raw.id,
    accountExternalId: raw.account.id,
    amount: raw.amount,
    currency: raw.currency,
    occurredAt: new Date(occurredAtRaw),
    description,
    observations: raw.observations,
    merchantName: raw.merchant?.name,
    categoryHint: raw.category ?? undefined,
    type: raw.type === "INFLOW" ? "INFLOW" : "OUTFLOW",
  }
}

export function mapBill(raw: BelvoBillResponse): ProviderBill {
  if (raw.bill_amount === undefined) throw new Error(`Belvo bill ${raw.id} sem bill_amount`)
  if (!raw.billing_date) throw new Error(`Belvo bill ${raw.id} sem billing_date`)
  if (!raw.due_date) throw new Error(`Belvo bill ${raw.id} sem due_date`)
  return {
    externalId: raw.id,
    accountExternalId: raw.account.id,
    amount: raw.bill_amount,
    currency: raw.currency,
    billingDate: new Date(raw.billing_date),
    dueDate: new Date(raw.due_date),
    description: `Fatura ${raw.id}`,
    status: raw.status,
  }
}

export function mapOwner(raw: BelvoOwnerResponse): ProviderOwner {
  return {
    displayName: raw.display_name ?? "(sem nome)",
    email: raw.email,
    phone: raw.phone_number,
    documentId: raw.document?.document_id,
    documentType: raw.document?.document_type,
  }
}
