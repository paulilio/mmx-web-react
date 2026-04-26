import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import {
  BANK_CONNECTION_REPOSITORY,
  type BankConnectionRepositoryPort,
} from "./ports/bank-connection-repository.port"
import {
  IMPORTED_TRANSACTION_REPOSITORY,
  type ImportedTransactionRepositoryPort,
  type ImportedTransactionListOptions,
  type PaginatedImportedTransactions,
} from "./ports/imported-transaction-repository.port"
import {
  SYNC_JOB_REPOSITORY,
  type SyncJobRepositoryPort,
} from "./ports/sync-job-repository.port"
import { SyncJobEntity } from "../domain/sync-job-entity"
import type { BankConnectionProps } from "../domain/bank-connection-entity"

export interface ConnectionView {
  id: string
  institutionCode: string
  institutionName: string
  status: string
  consentExpiresAt: Date | null
  lastSyncedAt: Date | null
  transactionCount: number
}

@Injectable()
export class OpenFinanceService {
  constructor(
    @Inject(BANK_CONNECTION_REPOSITORY)
    private readonly connections: BankConnectionRepositoryPort,
    @Inject(IMPORTED_TRANSACTION_REPOSITORY)
    private readonly imported: ImportedTransactionRepositoryPort,
    @Inject(SYNC_JOB_REPOSITORY)
    private readonly jobs: SyncJobRepositoryPort,
  ) {}

  async listForUser(userId: string): Promise<ConnectionView[]> {
    const conns = await this.connections.listByUser(userId)
    const views = await Promise.all(
      conns.map(async (c) => this.toView(c)),
    )
    return views
  }

  async enqueueSync(userId: string, connectionId: string): Promise<{ jobId: string }> {
    const conn = await this.assertOwnedByUser(userId, connectionId)
    const job = SyncJobEntity.create(conn.id as string, { reason: "manual-sync" })
    const saved = await this.jobs.create(job)
    if (!saved.id) throw new Error("SyncJob persistido sem id")
    return { jobId: saved.id }
  }

  async listImportedTransactions(
    userId: string,
    connectionId: string,
    opts?: ImportedTransactionListOptions,
  ): Promise<PaginatedImportedTransactions> {
    const conn = await this.assertOwnedByUser(userId, connectionId)
    return this.imported.listByConnection(conn.id as string, opts)
  }

  private async assertOwnedByUser(userId: string, connectionId: string): Promise<BankConnectionProps> {
    const conn = await this.connections.findById(connectionId)
    if (!conn) {
      throw new NotFoundException({
        data: null,
        error: { code: "NOT_FOUND", message: "Conexão não encontrada" },
      })
    }
    if (conn.userId !== userId) {
      throw new ForbiddenException({
        data: null,
        error: { code: "FORBIDDEN", message: "Sem permissão" },
      })
    }
    return conn
  }

  private async toView(c: BankConnectionProps): Promise<ConnectionView> {
    const transactionCount = c.id ? await this.imported.countByConnection(c.id) : 0
    return {
      id: c.id as string,
      institutionCode: c.institutionCode,
      institutionName: c.institutionName,
      status: c.status,
      consentExpiresAt: c.consentExpiresAt ?? null,
      lastSyncedAt: c.lastSyncedAt ?? null,
      transactionCount,
    }
  }
}
