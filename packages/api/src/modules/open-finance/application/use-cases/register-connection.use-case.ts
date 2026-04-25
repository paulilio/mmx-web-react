import { ConflictException, Inject, Injectable } from "@nestjs/common"
import { encrypt } from "@/core/lib/server/security/encryption"
import { BankConnectionEntity } from "../../domain/bank-connection-entity"
import { SyncJobEntity } from "../../domain/sync-job-entity"
import {
  BANK_CONNECTION_REPOSITORY,
  type BankConnectionRepositoryPort,
} from "../ports/bank-connection-repository.port"
import {
  OPEN_FINANCE_PROVIDER,
  type OpenFinanceProvider,
} from "../ports/open-finance-provider.port"
import {
  SYNC_JOB_REPOSITORY,
  type SyncJobRepositoryPort,
} from "../ports/sync-job-repository.port"

export interface RegisterConnectionInput {
  userId: string
  providerLinkId: string
  institutionCode: string
  institutionName: string
}

export interface RegisterConnectionOutput {
  id: string
  status: string
  institutionName: string
  jobId: string
  createdAt: Date
}

@Injectable()
export class RegisterConnectionUseCase {
  constructor(
    @Inject(OPEN_FINANCE_PROVIDER)
    private readonly provider: OpenFinanceProvider,
    @Inject(BANK_CONNECTION_REPOSITORY)
    private readonly connections: BankConnectionRepositoryPort,
    @Inject(SYNC_JOB_REPOSITORY)
    private readonly jobs: SyncJobRepositoryPort,
  ) {}

  async execute(input: RegisterConnectionInput): Promise<RegisterConnectionOutput> {
    const existing = await this.connections.findByProviderLinkId(
      this.provider.name,
      input.providerLinkId,
    )
    if (existing) {
      throw new ConflictException({
        data: null,
        error: { code: "CONNECTION_ALREADY_EXISTS", message: "Esta conexão já está registrada." },
      })
    }

    const link = await this.provider.fetchLink(input.providerLinkId)

    const entity = BankConnectionEntity.create({
      userId: input.userId,
      provider: this.provider.name,
      providerLinkId: encrypt(input.providerLinkId),
      institutionCode: input.institutionCode,
      institutionName: input.institutionName,
      consentExpiresAt: link.consentExpiresAt ?? null,
    })
    const saved = await this.connections.create(entity)
    if (!saved.id) throw new Error("BankConnection persistida sem id")

    const job = SyncJobEntity.create(saved.id, { reason: "initial-sync" })
    const savedJob = await this.jobs.create(job)
    if (!savedJob.id) throw new Error("SyncJob persistido sem id")

    return {
      id: saved.id,
      status: saved.status,
      institutionName: saved.institutionName,
      jobId: savedJob.id,
      createdAt: new Date(),
    }
  }
}
