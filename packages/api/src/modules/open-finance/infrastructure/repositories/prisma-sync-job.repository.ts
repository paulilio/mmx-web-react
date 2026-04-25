import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { Prisma } from "@prisma/client"
import type { SyncJobRepositoryPort } from "../../application/ports/sync-job-repository.port"
import type { SyncJobEntity, SyncJobProps, SyncJobStatus } from "../../domain/sync-job-entity"

@Injectable()
export class PrismaSyncJobRepository implements SyncJobRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: SyncJobEntity): Promise<SyncJobProps> {
    const v = entity.value
    const row = await this.prisma.openFinanceSyncJob.create({
      data: {
        bankConnectionId: v.bankConnectionId,
        status: v.status,
        attempts: v.attempts,
        scheduledAt: v.scheduledAt,
        startedAt: v.startedAt ?? null,
        finishedAt: v.finishedAt ?? null,
        lastError: v.lastError ?? null,
        payload: (v.payload ?? null) as Prisma.InputJsonValue,
      },
    })
    return rowToProps(row)
  }

  async findById(id: string): Promise<SyncJobProps | null> {
    const row = await this.prisma.openFinanceSyncJob.findUnique({ where: { id } })
    return row ? rowToProps(row) : null
  }

  /**
   * Atomically claims up to `limit` PENDING jobs whose scheduledAt <= now,
   * marks them RUNNING and returns them. Uses raw SQL with FOR UPDATE SKIP LOCKED
   * to allow safe concurrent workers.
   */
  async claimPending(limit: number): Promise<SyncJobProps[]> {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.$queryRaw<Array<{ id: string }>>(
        Prisma.sql`
          SELECT id FROM "OpenFinanceSyncJob"
          WHERE status = 'PENDING' AND "scheduledAt" <= NOW()
          ORDER BY "scheduledAt" ASC
          LIMIT ${limit}
          FOR UPDATE SKIP LOCKED
        `,
      )
      if (claimed.length === 0) return []
      const ids = claimed.map((r) => r.id)
      const now = new Date()
      await tx.openFinanceSyncJob.updateMany({
        where: { id: { in: ids } },
        data: { status: "RUNNING", startedAt: now, attempts: { increment: 1 } },
      })
      const rows = await tx.openFinanceSyncJob.findMany({ where: { id: { in: ids } } })
      return rows.map(rowToProps)
    })
  }

  async update(id: string, patch: Partial<SyncJobProps>): Promise<SyncJobProps> {
    const row = await this.prisma.openFinanceSyncJob.update({
      where: { id },
      data: {
        status: patch.status,
        attempts: patch.attempts,
        scheduledAt: patch.scheduledAt,
        startedAt: patch.startedAt ?? undefined,
        finishedAt: patch.finishedAt ?? undefined,
        lastError: patch.lastError ?? undefined,
        payload: patch.payload === undefined ? undefined : ((patch.payload ?? null) as Prisma.InputJsonValue),
      },
    })
    return rowToProps(row)
  }
}

interface SyncJobRow {
  id: string
  bankConnectionId: string
  status: SyncJobStatus
  attempts: number
  scheduledAt: Date
  startedAt: Date | null
  finishedAt: Date | null
  lastError: string | null
  payload: Prisma.JsonValue | null
}

function rowToProps(row: SyncJobRow): SyncJobProps {
  return {
    id: row.id,
    bankConnectionId: row.bankConnectionId,
    status: row.status,
    attempts: row.attempts,
    scheduledAt: row.scheduledAt,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    lastError: row.lastError,
    payload: row.payload as Record<string, unknown> | null,
  }
}
