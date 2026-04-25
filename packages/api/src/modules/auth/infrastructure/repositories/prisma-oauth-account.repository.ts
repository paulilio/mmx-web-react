import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import type {
  IOAuthAccountRepository,
  OAuthAccountRecord,
  OAuthProviderValue,
  CreateOAuthAccountInput,
} from "../../application/ports/oauth-account-repository.port"

@Injectable()
export class PrismaOAuthAccountRepository implements IOAuthAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProviderAccount(
    provider: OAuthProviderValue,
    providerAccountId: string,
  ): Promise<OAuthAccountRecord | null> {
    const row = await this.prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    })
    return row ? this.toRecord(row) : null
  }

  async create(input: CreateOAuthAccountInput): Promise<OAuthAccountRecord> {
    const row = await this.prisma.oAuthAccount.create({
      data: {
        userId: input.userId,
        provider: input.provider,
        providerAccountId: input.providerAccountId,
      },
    })
    return this.toRecord(row)
  }

  async listForUser(userId: string): Promise<OAuthAccountRecord[]> {
    const rows = await this.prisma.oAuthAccount.findMany({ where: { userId } })
    return rows.map((row) => this.toRecord(row))
  }

  private toRecord(row: {
    id: string
    userId: string
    provider: OAuthProviderValue
    providerAccountId: string
    createdAt: Date
  }): OAuthAccountRecord {
    return {
      id: row.id,
      userId: row.userId,
      provider: row.provider,
      providerAccountId: row.providerAccountId,
      createdAt: row.createdAt,
    }
  }
}
