import type { ConnectionView } from "@/modules/open-finance/application/open-finance.service"
import type {
  ImportedTransactionProps,
  ImportedTransactionStatus,
} from "@/modules/open-finance/domain/imported-transaction-entity"
import type { BankConnectionStatus } from "@/modules/open-finance/domain/bank-connection-rules"

type ClientConnectionStatus = "syncing" | "active" | "expired" | "revoked" | "error"

function toClientConnectionStatus(value: BankConnectionStatus): ClientConnectionStatus {
  if (value === "SYNCING") return "syncing"
  if (value === "ACTIVE") return "active"
  if (value === "EXPIRED") return "expired"
  if (value === "REVOKED") return "revoked"
  return "error"
}

type ClientImportedStatus = "pending" | "imported" | "duplicate" | "ignored"

function toClientImportedStatus(value: ImportedTransactionStatus): ClientImportedStatus {
  if (value === "PENDING") return "pending"
  if (value === "IMPORTED") return "imported"
  if (value === "DUPLICATE") return "duplicate"
  return "ignored"
}

export function mapConnection(view: ConnectionView) {
  return {
    id: view.id,
    institutionCode: view.institutionCode,
    institutionName: view.institutionName,
    status: toClientConnectionStatus(view.status as BankConnectionStatus),
    consentExpiresAt: view.consentExpiresAt?.toISOString() ?? null,
    lastSyncedAt: view.lastSyncedAt?.toISOString() ?? null,
    transactionCount: view.transactionCount,
  }
}

export function mapImportedTransaction(record: ImportedTransactionProps) {
  return {
    id: record.id,
    bankConnectionId: record.bankConnectionId,
    externalId: record.externalId,
    source: record.source.toLowerCase() as "transaction" | "bill",
    amount: record.amount,
    currency: record.currency,
    occurredAt: record.occurredAt.toISOString(),
    description: record.description,
    merchantName: record.merchantName ?? null,
    categoryHint: record.categoryHint ?? null,
    status: toClientImportedStatus(record.status),
    matchedTransactionId: record.matchedTransactionId ?? null,
  }
}
