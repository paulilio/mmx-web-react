import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import type {
  IOneTimeTokenRepository,
  OneTimeTokenRecord,
  CreateOneTimeTokenInput,
  OneTimeTokenPurposeValue,
} from "../../application/ports/one-time-token-repository.port"

@Injectable()
export class PrismaOneTimeTokenRepository implements IOneTimeTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateOneTimeTokenInput): Promise<OneTimeTokenRecord> {
    const created = await this.prisma.oneTimeToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        purpose: input.purpose,
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress ?? null,
      },
    })
    return this.toRecord(created)
  }

  async findActiveByHash(
    tokenHash: string,
    purpose: OneTimeTokenPurposeValue,
  ): Promise<OneTimeTokenRecord | null> {
    const row = await this.prisma.oneTimeToken.findUnique({ where: { tokenHash } })
    if (!row) return null
    if (row.purpose !== purpose) return null
    if (row.consumedAt) return null
    if (row.expiresAt.getTime() <= Date.now()) return null
    return this.toRecord(row)
  }

  async consume(id: string): Promise<void> {
    await this.prisma.oneTimeToken.update({
      where: { id },
      data: { consumedAt: new Date() },
    })
  }

  async invalidatePending(userId: string, purpose: OneTimeTokenPurposeValue): Promise<number> {
    const result = await this.prisma.oneTimeToken.updateMany({
      where: { userId, purpose, consumedAt: null },
      data: { consumedAt: new Date() },
    })
    return result.count
  }

  private toRecord(row: {
    id: string
    userId: string
    tokenHash: string
    purpose: OneTimeTokenPurposeValue
    expiresAt: Date
    consumedAt: Date | null
    createdAt: Date
  }): OneTimeTokenRecord {
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      purpose: row.purpose,
      expiresAt: row.expiresAt,
      consumedAt: row.consumedAt,
      createdAt: row.createdAt,
    }
  }
}
