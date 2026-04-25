import type {
  ProviderAccount,
  ProviderBill,
  ProviderLink,
  ProviderOwner,
  ProviderTransaction,
  ProviderWidgetTokenInput,
  ProviderWidgetTokenOutput,
} from "../../domain/open-finance.types"

export interface FetchTransactionsOptions {
  since?: Date
  pageSize?: number
}

export interface FetchBillsOptions {
  pageSize?: number
}

export interface OpenFinanceProvider {
  readonly name: string
  createWidgetToken(input: ProviderWidgetTokenInput): Promise<ProviderWidgetTokenOutput>
  fetchLink(linkId: string): Promise<ProviderLink>
  fetchAccounts(linkId: string): Promise<ProviderAccount[]>
  fetchTransactions(linkId: string, opts?: FetchTransactionsOptions): Promise<ProviderTransaction[]>
  fetchBills(linkId: string, opts?: FetchBillsOptions): Promise<ProviderBill[]>
  fetchOwners(linkId: string): Promise<ProviderOwner[]>
  revokeLink(linkId: string): Promise<void>
}

export const OPEN_FINANCE_PROVIDER = Symbol("OPEN_FINANCE_PROVIDER")
