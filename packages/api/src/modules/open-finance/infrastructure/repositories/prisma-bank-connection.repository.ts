import { Injectable, Logger } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { decrypt } from "@/core/lib/server/security/encryption"
import type { BankConnectionRepositoryPort } from "../../application/ports/bank-connection-repository.port"
import type { BankConnectionEntity, BankConnectionProps } from "../../domain/bank-connection-entity"
import type { BankConnectionStatus } from "../../domain/bank-connection-rules"

@Injectable()
export class PrismaBankConnectionRepository implements BankConnectionRepositoryPort {
  private readonly logger = new Logger(PrismaBankConnectionRepository.name)

  constructor(private readonly prisma: PrismaService) {}

  async create(entity: BankConnectionEntity): Promise<BankConnectionProps> {
    const v = entity.value
    const row = await this.prisma.bankConnection.create({
      data: {
        userId: v.userId,
        provider: v.provider,
        providerLinkId: v.providerLinkId,
        institutionCode: v.institutionCode,
        institutionName: v.institutionName,
        status: v.status,
        consentExpiresAt: v.consentExpiresAt ?? null,
        lastSyncedAt: v.lastSyncedAt ?? null,
        lastError: v.lastError ?? null,
      },
    })
    return rowToProps(row)
  }

  async findById(id: string): Promise<BankConnectionProps | null> {
    const row = await this.prisma.bankConnection.findUnique({ where: { id } })
    return row ? rowToProps(row) : null
  }

  async findByIdAndUser(id: string, userId: string): Promise<BankConnectionProps | null> {
    const row = await this.prisma.bankConnection.findFirst({ where: { id, userId } })
    return row ? rowToProps(row) : null
  }

  async findByProviderLinkId(provider: string, providerLinkId: string): Promise<BankConnectionProps | null> {
    const row = await this.prisma.bankConnection.findUnique({
      where: { provider_providerLinkId: { provider, providerLinkId } },
    })
    return row ? rowToProps(row) : null
  }

  async findByPlainProviderLinkId(
    provider: string,
    plainProviderLinkId: string,
  ): Promise<BankConnectionProps | null> {
    const rows = await this.prisma.bankConnection.findMany({ where: { provider } })
    for (const row of rows) {
      try {
        if (decrypt(row.providerLinkId) === plainProviderLinkId) return rowToProps(row)
      } catch (err) {
        this.logger.warn(`Falha ao decrypt providerLinkId de connection ${row.id}: ${(err as Error).message}`)
      }
    }
    return null
  }

  async listByUser(userId: string): Promise<BankConnectionProps[]> {
    const rows = await this.prisma.bankConnection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
    return rows.map(rowToProps)
  }

  async update(id: string, patch: Partial<BankConnectionProps>): Promise<BankConnectionProps> {
    const row = await this.prisma.bankConnection.update({
      where: { id },
      data: {
        status: patch.status,
        consentExpiresAt: patch.consentExpiresAt ?? undefined,
        lastSyncedAt: patch.lastSyncedAt ?? undefined,
        lastError: patch.lastError ?? undefined,
        institutionName: patch.institutionName,
      },
    })
    return rowToProps(row)
  }
}

interface BankConnectionRow {
  id: string
  userId: string
  provider: string
  providerLinkId: string
  institutionCode: string
  institutionName: string
  status: BankConnectionStatus
  consentExpiresAt: Date | null
  lastSyncedAt: Date | null
  lastError: string | null
}

function rowToProps(row: BankConnectionRow): BankConnectionProps {
  return {
    id: row.id,
    userId: row.userId,
    provider: row.provider,
    providerLinkId: row.providerLinkId,
    institutionCode: row.institutionCode,
    institutionName: row.institutionName,
    status: row.status,
    consentExpiresAt: row.consentExpiresAt,
    lastSyncedAt: row.lastSyncedAt,
    lastError: row.lastError,
  }
}
