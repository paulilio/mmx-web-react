import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { getPagination, type PaginatedResult } from "@/common/types/pagination.types"
import type { IAccountRepository } from "../../application/ports/account-repository.port"
import type {
  AccountFilters,
  AccountRecord,
  CreateAccountRecordInput,
  UpdateAccountRecordInput,
} from "../../domain/account.types"

type RawPrismaAccount = {
  id: string
  userId: string
  name: string
  institutionName: string | null
  type: AccountRecord["type"]
  status: AccountRecord["status"]
  currency: string
  openingBalance: { toNumber: () => number } | number
  openingBalanceDate: Date
  color: string | null
  icon: string | null
  isBusiness: boolean
  creditLimit: { toNumber: () => number } | number | null
  closingDay: number | null
  dueDay: number | null
  bankConnectionId: string | null
  externalId: string | null
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

function decimalToNumber(value: { toNumber: () => number } | number | null | undefined): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  return value.toNumber()
}

function nullableDecimalToNumber(value: { toNumber: () => number } | number | null | undefined): number | null {
  if (value == null) return null
  if (typeof value === "number") return value
  return value.toNumber()
}

function fromPrisma(raw: RawPrismaAccount): AccountRecord {
  return {
    id: raw.id,
    userId: raw.userId,
    name: raw.name,
    institutionName: raw.institutionName,
    type: raw.type,
    status: raw.status,
    currency: raw.currency,
    openingBalance: decimalToNumber(raw.openingBalance),
    openingBalanceDate: raw.openingBalanceDate,
    color: raw.color,
    icon: raw.icon,
    isBusiness: raw.isBusiness,
    creditLimit: nullableDecimalToNumber(raw.creditLimit),
    closingDay: raw.closingDay,
    dueDay: raw.dueDay,
    bankConnectionId: raw.bankConnectionId,
    externalId: raw.externalId,
    archivedAt: raw.archivedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

@Injectable()
export class PrismaAccountRepository implements IAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, userId: string): Promise<AccountRecord | null> {
    const raw = (await this.prisma.account.findFirst({ where: { id, userId } })) as RawPrismaAccount | null
    return raw ? fromPrisma(raw) : null
  }

  async findByUserAndName(userId: string, name: string): Promise<AccountRecord | null> {
    const raw = (await this.prisma.account.findFirst({
      where: { userId, name: name.trim() },
    })) as RawPrismaAccount | null
    return raw ? fromPrisma(raw) : null
  }

  async findMany(
    filters: AccountFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<AccountRecord>> {
    const { skip, take, page, pageSize } = getPagination(pagination)
    const where = {
      userId: filters.userId,
      type: filters.type,
      status: filters.status,
    }

    const [rawData, total] = (await Promise.all([
      this.prisma.account.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.account.count({ where }),
    ])) as [RawPrismaAccount[], number]

    return { data: rawData.map(fromPrisma), total, page, pageSize }
  }

  async create(data: CreateAccountRecordInput): Promise<AccountRecord> {
    const raw = (await this.prisma.account.create({ data })) as RawPrismaAccount
    return fromPrisma(raw)
  }

  async update(
    id: string,
    userId: string,
    data: UpdateAccountRecordInput,
  ): Promise<AccountRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) {
      return null
    }

    const raw = (await this.prisma.account.update({ where: { id }, data })) as RawPrismaAccount
    return fromPrisma(raw)
  }

  async archive(id: string, userId: string): Promise<AccountRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) {
      return null
    }

    const raw = (await this.prisma.account.update({
      where: { id },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    })) as RawPrismaAccount
    return fromPrisma(raw)
  }

  async computeMovement(accountId: string, userId: string): Promise<number> {
    // Agrega o impacto liquido das transacoes COMPLETED nesta conta:
    // - INCOME soma positivo (entrada)
    // - EXPENSE subtrai (saida)
    // - TRANSFER role=CREDIT soma; role=DEBIT subtrai
    // PENDING nao entra (pode ser futura). CANCELLED ignorada.
    const result = (await this.prisma.$queryRawUnsafe(
      `
      SELECT COALESCE(SUM(
        CASE
          WHEN "type" = 'INCOME' THEN "amount"
          WHEN "type" = 'EXPENSE' THEN -"amount"
          WHEN "type" = 'TRANSFER' AND "transferRole" = 'CREDIT' THEN "amount"
          WHEN "type" = 'TRANSFER' AND "transferRole" = 'DEBIT' THEN -"amount"
          ELSE 0
        END
      ), 0) AS "delta"
      FROM "Transaction"
      WHERE "userId" = $1
        AND "accountId" = $2
        AND "status" = 'COMPLETED'
        AND "deletedAt" IS NULL
      `,
      userId,
      accountId,
    )) as Array<{ delta: string | number | null }>

    const raw = result[0]?.delta ?? 0
    return typeof raw === "number" ? raw : Number(raw)
  }
}
