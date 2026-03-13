import { prisma } from "@/lib/server/db/prisma"
import { Prisma } from "@prisma/client"
import type {
  DomainTransactionStatus,
  DomainTransactionType,
} from "@/lib/domain/transactions/transaction-entity"
import { BaseRepository, type PaginatedResult } from "./base-repository"

export interface TransactionRecord {
  id: string
  userId: string
  description: string
  amount: number
  type: DomainTransactionType
  categoryId: string
  contactId?: string | null
  date: Date
  status: DomainTransactionStatus
  notes?: string | null
  recurrence?: unknown
  areaId?: string | null
  categoryGroupId?: string | null
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateTransactionRecordInput {
  userId: string
  description: string
  amount: number
  type: DomainTransactionType
  categoryId: string
  date: Date
  status: DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
}

export interface UpdateTransactionRecordInput {
  description?: string
  amount?: number
  type?: DomainTransactionType
  categoryId?: string
  date?: Date
  status?: DomainTransactionStatus
  notes?: string | null
  contactId?: string | null
  areaId?: string | null
  categoryGroupId?: string | null
}

export interface TransactionFilters {
  userId: string
  status?: DomainTransactionStatus
  type?: DomainTransactionType
  categoryId?: string
  dateFrom?: string
  dateTo?: string
}

export interface TransactionSummaryGroupRecord {
  type: DomainTransactionType
  status: DomainTransactionStatus
  totalAmount: number
}

export interface TransactionAgingGroupRecord {
  date: Date
  status: DomainTransactionStatus
  totalAmount: number
}

export interface TransactionCashflowGroupRecord {
  date: Date
  type: DomainTransactionType
  status: DomainTransactionStatus
  totalAmount: number
}

export type CashflowStatusFilter = "all" | "completed" | "pending" | "cancelled"

interface SummarySqlRow {
  type: DomainTransactionType
  status: DomainTransactionStatus
  totalAmount: unknown
}

interface AgingSqlRow {
  date: Date
  status: DomainTransactionStatus
  totalAmount: unknown
}

interface CashflowSqlRow {
  date: Date
  type: DomainTransactionType
  status: DomainTransactionStatus
  totalAmount: unknown
}

export class TransactionRepository extends BaseRepository {
  constructor(dbClient = prisma) {
    super(dbClient)
  }

  async findById(id: string, userId: string): Promise<TransactionRecord | null> {
    return this.prisma.transaction.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    }) as Promise<TransactionRecord | null>
  }

  async findMany(
    filters: TransactionFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<TransactionRecord>> {
    const { skip, take, page, pageSize } = this.getPagination(pagination)

    const where = {
      userId: filters.userId,
      deletedAt: null,
      status: filters.status,
      type: filters.type,
      categoryId: filters.categoryId,
      date: {
        gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
      },
    }

    const [data, total] = (await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: {
          date: "desc",
        },
        skip,
        take,
      }),
      this.prisma.transaction.count({ where }),
    ])) as [TransactionRecord[], number]

    return this.toPaginatedResult(data, total, page, pageSize)
  }

  async findAllByUser(userId: string): Promise<TransactionRecord[]> {
    return this.prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      orderBy: {
        date: "desc",
      },
    }) as Promise<TransactionRecord[]>
  }

  async create(data: CreateTransactionRecordInput): Promise<TransactionRecord> {
    return this.prisma.transaction.create({
      data,
    }) as Promise<TransactionRecord>
  }

  async summarizeByTypeAndStatus(userId: string): Promise<TransactionSummaryGroupRecord[]> {
    const rows = (await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT
          "type",
          "status",
          COALESCE(SUM("amount"), 0) AS "totalAmount"
        FROM "Transaction"
        WHERE "userId" = ${userId}
          AND "deletedAt" IS NULL
        GROUP BY "type", "status"
      `,
    )) as SummarySqlRow[]

    return rows.map((item) => ({
      type: item.type,
      status: item.status,
      totalAmount: Number(item.totalAmount ?? 0),
    }))
  }

  async summarizeAgingExpenses(
    userId: string,
    filters?: { dateFrom?: Date; dateTo?: Date },
  ): Promise<TransactionAgingGroupRecord[]> {
    const dateFromClause = filters?.dateFrom ? Prisma.sql` AND "date" >= ${filters.dateFrom}` : Prisma.empty
    const dateToClause = filters?.dateTo ? Prisma.sql` AND "date" <= ${filters.dateTo}` : Prisma.empty

    const rows = (await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT
          "date",
          "status",
          COALESCE(SUM("amount"), 0) AS "totalAmount"
        FROM "Transaction"
        WHERE "userId" = ${userId}
          AND "deletedAt" IS NULL
          AND "type" = 'EXPENSE'
          AND "status" <> 'CANCELLED'
          ${dateFromClause}
          ${dateToClause}
        GROUP BY "date", "status"
      `,
    )) as AgingSqlRow[]

    return rows.map((item) => ({
      date: item.date,
      status: item.status,
      totalAmount: Number(item.totalAmount ?? 0),
    }))
  }

  async summarizeCashflowByDate(
    userId: string,
    options: { fromDate: Date; status: CashflowStatusFilter },
  ): Promise<TransactionCashflowGroupRecord[]> {
    const statusClause =
      options.status === "all"
        ? Prisma.empty
        : options.status === "completed"
          ? Prisma.sql` AND "status" = 'COMPLETED'`
          : options.status === "pending"
            ? Prisma.sql` AND "status" = 'PENDING'`
            : Prisma.sql` AND "status" = 'CANCELLED'`

    const rows = (await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT
          "date",
          "type",
          "status",
          COALESCE(SUM("amount"), 0) AS "totalAmount"
        FROM "Transaction"
        WHERE "userId" = ${userId}
          AND "deletedAt" IS NULL
          AND "date" >= ${options.fromDate}
          ${statusClause}
        GROUP BY "date", "type", "status"
      `,
    )) as CashflowSqlRow[]

    return rows.map((item) => ({
      date: item.date,
      type: item.type,
      status: item.status,
      totalAmount: Number(item.totalAmount ?? 0),
    }))
  }

  async update(id: string, userId: string, data: UpdateTransactionRecordInput): Promise<TransactionRecord | null> {
    const existing = await this.findById(id, userId)

    if (!existing) {
      return null
    }

    return this.prisma.transaction.update({
      where: { id },
      data,
    }) as Promise<TransactionRecord>
  }

  async delete(id: string, userId: string): Promise<TransactionRecord | null> {
    const existing = await this.findById(id, userId)

    if (!existing) {
      return null
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    }) as Promise<TransactionRecord>
  }
}
