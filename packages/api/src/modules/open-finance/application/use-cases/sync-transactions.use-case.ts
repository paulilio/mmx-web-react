import { Inject, Injectable, Logger } from "@nestjs/common"
import { decrypt } from "@/core/lib/server/security/encryption"
import { BankConnectionEntity } from "../../domain/bank-connection-entity"
import { ImportedTransactionEntity } from "../../domain/imported-transaction-entity"
import {
  BANK_CONNECTION_REPOSITORY,
  type BankConnectionRepositoryPort,
} from "../ports/bank-connection-repository.port"
import {
  IMPORTED_TRANSACTION_REPOSITORY,
  type ImportedTransactionRepositoryPort,
} from "../ports/imported-transaction-repository.port"
import {
  OPEN_FINANCE_PROVIDER,
  type OpenFinanceProvider,
} from "../ports/open-finance-provider.port"

export interface SyncTransactionsInput {
  bankConnectionId: string
}

export interface SyncTransactionsOutput {
  bankConnectionId: string
  imported: { transactions: number; bills: number; skipped: number }
}

@Injectable()
export class SyncTransactionsUseCase {
  private readonly logger = new Logger(SyncTransactionsUseCase.name)

  constructor(
    @Inject(OPEN_FINANCE_PROVIDER)
    private readonly provider: OpenFinanceProvider,
    @Inject(BANK_CONNECTION_REPOSITORY)
    private readonly connections: BankConnectionRepositoryPort,
    @Inject(IMPORTED_TRANSACTION_REPOSITORY)
    private readonly imported: ImportedTransactionRepositoryPort,
  ) {}

  async execute(input: SyncTransactionsInput): Promise<SyncTransactionsOutput> {
    const conn = await this.connections.findById(input.bankConnectionId)
    if (!conn) throw new Error(`BankConnection ${input.bankConnectionId} não encontrada`)
    if (!conn.id) throw new Error("BankConnection sem id")
    if (conn.status === "REVOKED") {
      throw new Error("Não é possível sincronizar uma conexão revogada")
    }

    const linkId = decrypt(conn.providerLinkId)
    const since = conn.lastSyncedAt ?? defaultSince()

    const [transactions, bills] = await Promise.all([
      this.provider.fetchTransactions(linkId, { since }),
      this.provider.fetchBills(linkId),
    ])

    const txEntities = transactions.map((t) =>
      ImportedTransactionEntity.create({
        bankConnectionId: conn.id as string,
        externalId: t.externalId,
        source: "TRANSACTION",
        rawPayload: t as unknown as Record<string, unknown>,
        amount: t.amount,
        currency: t.currency,
        occurredAt: t.occurredAt,
        description: t.description,
        merchantName: t.merchantName ?? null,
        categoryHint: t.categoryHint ?? null,
      }),
    )

    const billEntities = bills.map((b) =>
      ImportedTransactionEntity.create({
        bankConnectionId: conn.id as string,
        externalId: `bill_${b.externalId}`,
        source: "BILL",
        rawPayload: b as unknown as Record<string, unknown>,
        amount: b.amount,
        currency: b.currency,
        occurredAt: b.billingDate,
        description: b.description,
      }),
    )

    const txResult = await this.imported.upsertMany(txEntities)
    const billResult = await this.imported.upsertMany(billEntities)
    const skipped = txResult.skipped + billResult.skipped

    const entity = BankConnectionEntity.fromRecord(conn)
    await this.connections.update(conn.id, entity.markActive(new Date()))

    this.logger.log(
      `Sync completo bc=${conn.id} tx=${txResult.created} bills=${billResult.created} skipped=${skipped}`,
    )

    return {
      bankConnectionId: conn.id,
      imported: { transactions: txResult.created, bills: billResult.created, skipped },
    }
  }
}

function defaultSince(): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - 12)
  return d
}
