import { Inject, Injectable, Logger } from "@nestjs/common"
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

export interface HandleWebhookEventInput {
  eventType: string | null
  linkId: string | null
}

export interface HandleWebhookEventOutput {
  action: "expired" | "invalid" | "token_required" | "sync_enqueued" | "noop"
}

@Injectable()
export class HandleWebhookEventUseCase {
  private readonly logger = new Logger(HandleWebhookEventUseCase.name)

  constructor(
    @Inject(OPEN_FINANCE_PROVIDER)
    private readonly provider: OpenFinanceProvider,
    @Inject(BANK_CONNECTION_REPOSITORY)
    private readonly connections: BankConnectionRepositoryPort,
    @Inject(SYNC_JOB_REPOSITORY)
    private readonly jobs: SyncJobRepositoryPort,
  ) {}

  async execute(input: HandleWebhookEventInput): Promise<HandleWebhookEventOutput> {
    if (!input.eventType || !input.linkId) return { action: "noop" }

    const connection = await this.connections.findByPlainProviderLinkId(
      this.provider.name,
      input.linkId,
    )
    if (!connection || !connection.id) {
      this.logger.warn(
        `Webhook ${input.eventType} para link desconhecido (provider=${this.provider.name})`,
      )
      return { action: "noop" }
    }

    switch (input.eventType) {
      case "consent_expired":
      case "link.expired":
        await this.connections.update(connection.id, {
          status: "EXPIRED",
          lastError: "consent_expired",
        })
        return { action: "expired" }

      case "link.invalid":
        await this.connections.update(connection.id, {
          status: "ERROR",
          lastError: "link_invalid",
        })
        return { action: "invalid" }

      case "token_required":
        await this.connections.update(connection.id, {
          status: "EXPIRED",
          lastError: "token_required",
        })
        return { action: "token_required" }

      case "transactions.new":
      case "transactions.historical_update": {
        const job = SyncJobEntity.create(connection.id, {
          reason: "webhook",
          eventType: input.eventType,
        })
        await this.jobs.create(job)
        return { action: "sync_enqueued" }
      }

      default:
        return { action: "noop" }
    }
  }
}
