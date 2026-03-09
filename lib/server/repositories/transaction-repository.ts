import { prisma } from "@/lib/server/db/prisma"
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

export class TransactionRepository extends BaseRepository {
  constructor(dbClient = prisma) {
    super(dbClient)
  }

  async findById(id: string, userId: string): Promise<TransactionRecord | null> {
    return this.prisma.transaction.findFirst({
      where: {
        id,
        userId,
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
      where: { userId },
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

    return this.prisma.transaction.delete({
      where: { id },
    }) as Promise<TransactionRecord>
  }
}
