import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import type {
  IRefreshSessionRepository,
  RefreshSessionRecord,
  CreateRefreshSessionInput,
} from "../../application/ports/refresh-session-repository.port"

@Injectable()
export class PrismaRefreshSessionRepository implements IRefreshSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateRefreshSessionInput): Promise<RefreshSessionRecord> {
    const created = await this.prisma.refreshSession.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
      },
    })
    return this.toRecord(created)
  }

  async findActiveByTokenHash(tokenHash: string): Promise<RefreshSessionRecord | null> {
    const found = await this.prisma.refreshSession.findUnique({ where: { tokenHash } })
    if (!found) return null
    if (found.revokedAt) return null
    if (found.expiresAt.getTime() <= Date.now()) return null
    return this.toRecord(found)
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const result = await this.prisma.refreshSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return result.count
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.refreshSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    return result.count
  }

  private toRecord(row: {
    id: string
    userId: string
    tokenHash: string
    expiresAt: Date
    revokedAt: Date | null
    createdAt: Date
  }): RefreshSessionRecord {
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
    }
  }
}
