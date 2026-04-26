import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { Prisma } from "@prisma/client"
import type {
  ImportedTransactionListOptions,
  ImportedTransactionRepositoryPort,
  PaginatedImportedTransactions,
} from "../../application/ports/imported-transaction-repository.port"
import type {
  ImportedTransactionEntity,
  ImportedTransactionProps,
  ImportedTransactionSource,
  ImportedTransactionStatus,
} from "../../domain/imported-transaction-entity"

@Injectable()
export class PrismaImportedTransactionRepository implements ImportedTransactionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMany(entities: ImportedTransactionEntity[]): Promise<{ created: number; skipped: number }> {
    let created = 0
    let skipped = 0
    for (const entity of entities) {
      const v = entity.value
      try {
        await this.prisma.importedTransaction.create({
          data: {
            bankConnectionId: v.bankConnectionId,
            externalId: v.externalId,
            source: v.source,
            rawPayload: v.rawPayload as Prisma.InputJsonValue,
            amount: new Prisma.Decimal(v.amount),
            currency: v.currency,
            occurredAt: v.occurredAt,
            description: v.description,
            merchantName: v.merchantName ?? null,
            categoryHint: v.categoryHint ?? null,
            status: v.status,
            matchedTransactionId: v.matchedTransactionId ?? null,
          },
        })
        created += 1
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          skipped += 1
          continue
        }
        throw err
      }
    }
    return { created, skipped }
  }

  async findById(id: string): Promise<ImportedTransactionProps | null> {
    const row = await this.prisma.importedTransaction.findUnique({ where: { id } })
    return row ? rowToProps(row) : null
  }

  async findByExternalId(bankConnectionId: string, externalId: string): Promise<ImportedTransactionProps | null> {
    const row = await this.prisma.importedTransaction.findUnique({
      where: { bankConnectionId_externalId: { bankConnectionId, externalId } },
    })
    return row ? rowToProps(row) : null
  }

  async listByConnection(
    bankConnectionId: string,
    opts?: ImportedTransactionListOptions,
  ): Promise<PaginatedImportedTransactions> {
    const page = Math.max(1, opts?.page ?? 1)
    const pageSize = Math.min(200, Math.max(1, opts?.pageSize ?? 50))
    const where = { bankConnectionId, ...(opts?.status ? { status: opts.status } : {}) }
    const [rows, total] = await Promise.all([
      this.prisma.importedTransaction.findMany({
        where,
        orderBy: { occurredAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.importedTransaction.count({ where }),
    ])
    return { items: rows.map(rowToProps), total, page, pageSize }
  }

  async countByConnection(bankConnectionId: string): Promise<number> {
    return this.prisma.importedTransaction.count({ where: { bankConnectionId } })
  }

  async update(id: string, patch: Partial<ImportedTransactionProps>): Promise<ImportedTransactionProps> {
    const row = await this.prisma.importedTransaction.update({
      where: { id },
      data: {
        status: patch.status,
        matchedTransactionId: patch.matchedTransactionId ?? undefined,
      },
    })
    return rowToProps(row)
  }
}

interface ImportedTransactionRow {
  id: string
  bankConnectionId: string
  externalId: string
  source: ImportedTransactionSource
  rawPayload: Prisma.JsonValue
  amount: Prisma.Decimal
  currency: string
  occurredAt: Date
  description: string
  merchantName: string | null
  categoryHint: string | null
  status: ImportedTransactionStatus
  matchedTransactionId: string | null
}

function rowToProps(row: ImportedTransactionRow): ImportedTransactionProps {
  return {
    id: row.id,
    bankConnectionId: row.bankConnectionId,
    externalId: row.externalId,
    source: row.source,
    rawPayload: row.rawPayload as Record<string, unknown>,
    amount: row.amount.toNumber(),
    currency: row.currency,
    occurredAt: row.occurredAt,
    description: row.description,
    merchantName: row.merchantName,
    categoryHint: row.categoryHint,
    status: row.status,
    matchedTransactionId: row.matchedTransactionId,
  }
}
