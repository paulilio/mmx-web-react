import { Module, type FactoryProvider } from "@nestjs/common"
import { OpenFinanceController } from "./open-finance.controller"
import { OpenFinanceWebhookController } from "./open-finance.webhook.controller"
import { OpenFinanceService } from "./application/open-finance.service"
import { CreateWidgetTokenUseCase } from "./application/use-cases/create-widget-token.use-case"
import { RegisterConnectionUseCase } from "./application/use-cases/register-connection.use-case"
import { SyncTransactionsUseCase } from "./application/use-cases/sync-transactions.use-case"
import { RevokeConnectionUseCase } from "./application/use-cases/revoke-connection.use-case"
import { ReconcileTransactionUseCase } from "./application/use-cases/reconcile-transaction.use-case"
import { SyncJobRunner } from "./application/jobs/sync-job.runner"
import {
  BANK_CONNECTION_REPOSITORY,
} from "./application/ports/bank-connection-repository.port"
import {
  IMPORTED_TRANSACTION_REPOSITORY,
} from "./application/ports/imported-transaction-repository.port"
import {
  SYNC_JOB_REPOSITORY,
} from "./application/ports/sync-job-repository.port"
import {
  OPEN_FINANCE_PROVIDER,
} from "./application/ports/open-finance-provider.port"
import { PrismaBankConnectionRepository } from "./infrastructure/repositories/prisma-bank-connection.repository"
import { PrismaImportedTransactionRepository } from "./infrastructure/repositories/prisma-imported-transaction.repository"
import { PrismaSyncJobRepository } from "./infrastructure/repositories/prisma-sync-job.repository"
import { BelvoHttpClient } from "./infrastructure/providers/belvo-http.client"
import { BelvoProviderAdapter } from "./infrastructure/providers/belvo-provider.adapter"

function createDisabledProvider(reason: string) {
  const fail = (): never => {
    throw new Error(`Open Finance indisponível: ${reason}`)
  }
  return {
    name: "belvo-disabled",
    createWidgetToken: async () => fail(),
    fetchLink: async () => fail(),
    fetchAccounts: async () => fail(),
    fetchTransactions: async () => fail(),
    fetchBills: async () => fail(),
    fetchOwners: async () => fail(),
    revokeLink: async () => fail(),
  }
}

const belvoProvider: FactoryProvider = {
  provide: OPEN_FINANCE_PROVIDER,
  useFactory: () => {
    const secretId = process.env.BELVO_SECRET_ID
    const secretPassword = process.env.BELVO_SECRET_PASSWORD
    if (!secretId || !secretPassword) {
      return createDisabledProvider("BELVO_SECRET_ID/BELVO_SECRET_PASSWORD ausentes")
    }
    const env = process.env.BELVO_ENV ?? "sandbox"
    const host = env === "production" ? "https://api.belvo.com" : "https://sandbox.belvo.com"
    const http = new BelvoHttpClient({ host, secretId, secretPassword })
    return new BelvoProviderAdapter(http, secretId, secretPassword)
  },
}

@Module({
  controllers: [OpenFinanceController, OpenFinanceWebhookController],
  providers: [
    OpenFinanceService,
    CreateWidgetTokenUseCase,
    RegisterConnectionUseCase,
    SyncTransactionsUseCase,
    RevokeConnectionUseCase,
    ReconcileTransactionUseCase,
    SyncJobRunner,
    { provide: BANK_CONNECTION_REPOSITORY, useClass: PrismaBankConnectionRepository },
    { provide: IMPORTED_TRANSACTION_REPOSITORY, useClass: PrismaImportedTransactionRepository },
    { provide: SYNC_JOB_REPOSITORY, useClass: PrismaSyncJobRepository },
    belvoProvider,
  ],
  exports: [SyncTransactionsUseCase, OpenFinanceService],
})
export class OpenFinanceModule {}
