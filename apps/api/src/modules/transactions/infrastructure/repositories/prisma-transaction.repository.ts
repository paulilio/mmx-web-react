import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { Prisma } from "@prisma/client"
import { getPagination, type PaginatedResult } from "@/common/types/pagination.types"
import type { ITransactionRepository } from "../../application/ports/transaction-repository.port"
import type {
  TransactionRecord,
  CreateTransactionRecordInput,
  UpdateTransactionRecordInput,
  TransactionFilters,
  TransactionSummaryGroupRecord,
  TransactionAgingGroupRecord,
  TransactionCashflowGroupRecord,
  CashflowStatusFilter,
} from "../../domain/transaction.types"

interface SummarySqlRow {
  type: TransactionRecord["type"]
  status: TransactionRecord["status"]
  totalAmount: unknown
}

interface AgingSqlRow {
  date: Date
  status: TransactionRecord["status"]
  totalAmount: unknown
}

interface CashflowSqlRow {
  date: Date
  type: TransactionRecord["type"]
  status: TransactionRecord["status"]
  totalAmount: unknown
}

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string, userId: string): Promise<TransactionRecord | null> {
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
    const { skip, take, page, pageSize } = getPagination(pagination)

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
        orderBy: { date: "desc" },
        skip,
        take,
      }),
      this.prisma.transaction.count({ where }),
    ])) as [TransactionRecord[], number]

    return { data, total, page, pageSize }
  }

  create(data: CreateTransactionRecordInput): Promise<TransactionRecord> {
    return this.prisma.transaction.create({ data }) as Promise<TransactionRecord>
  }

  async update(
    id: string,
    userId: string,
    data: UpdateTransactionRecordInput,
  ): Promise<TransactionRecord | null> {
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

  summarizeByTypeAndStatus(
    userId: string,
  ): Promise<TransactionSummaryGroupRecord[]> {
    return this.prisma
      .$queryRaw(
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
      )
      .then((rows) => rows as SummarySqlRow[])
      .then((rows) =>
        rows.map((item) => ({
          type: item.type,
          status: item.status,
          totalAmount: Number(item.totalAmount ?? 0),
        })),
      )
  }

  summarizeAgingExpenses(
    userId: string,
    options: { fromDate: Date; toDate?: Date },
  ): Promise<TransactionAgingGroupRecord[]> {
    const dateFromClause = options?.fromDate
      ? Prisma.sql` AND "date" >= ${options.fromDate}`
      : Prisma.empty
    const dateToClause = options?.toDate
      ? Prisma.sql` AND "date" <= ${options.toDate}`
      : Prisma.empty

    return this.prisma
      .$queryRaw(
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
      )
      .then((rows) => rows as AgingSqlRow[])
      .then((rows) =>
        rows.map((item) => ({
          date: item.date,
          status: item.status,
          totalAmount: Number(item.totalAmount ?? 0),
        })),
      )
  }

  summarizeCashflowByDate(
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

    return this.prisma
      .$queryRaw(
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
      )
      .then((rows) => rows as CashflowSqlRow[])
      .then((rows) =>
        rows.map((item) => ({
          date: item.date,
          type: item.type,
          status: item.status,
          totalAmount: Number(item.totalAmount ?? 0),
        })),
      )
  }
}
