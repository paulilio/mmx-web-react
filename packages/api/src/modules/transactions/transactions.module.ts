import { Module } from "@nestjs/common"
import { TransactionsController } from "./transactions.controller"
import { TRANSACTION_REPOSITORY } from "./application/ports/transaction-repository.port"
import { RECURRING_TEMPLATE_REPOSITORY } from "./application/ports/recurring-template-repository.port"
import { PrismaTransactionRepository } from "./infrastructure/repositories/prisma-transaction.repository"
import { PrismaRecurringTemplateRepository } from "./infrastructure/repositories/prisma-recurring-template.repository"
import { TransactionApplicationService } from "./application/transaction.service"
import { RecurringTemplateApplicationService } from "./application/recurring-template.service"
import { CreateRecurringSeriesUseCase } from "./application/use-cases/create-recurring-series.use-case"
import { UpdateRecurringSeriesUseCase } from "./application/use-cases/update-recurring-series.use-case"
import { ToggleRecurringPauseUseCase } from "./application/use-cases/toggle-recurring-pause.use-case"
import { SkipNextOccurrenceUseCase } from "./application/use-cases/skip-next-occurrence.use-case"
import { DuplicateTransactionUseCase } from "./application/use-cases/duplicate-transaction.use-case"
import { MarkAsExceptionUseCase } from "./application/use-cases/mark-as-exception.use-case"
import { DeleteRecurringSeriesUseCase } from "./application/use-cases/delete-recurring-series.use-case"
import { CreateTransferUseCase } from "./application/use-cases/create-transfer.use-case"
import { AccountsModule } from "../accounts/accounts.module"
import { ACCOUNT_REPOSITORY } from "../accounts/application/ports/account-repository.port"
import { PrismaAccountRepository } from "../accounts/infrastructure/repositories/prisma-account.repository"

@Module({
  imports: [AccountsModule],
  controllers: [TransactionsController],
  providers: [
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    { provide: RECURRING_TEMPLATE_REPOSITORY, useClass: PrismaRecurringTemplateRepository },
    { provide: ACCOUNT_REPOSITORY, useClass: PrismaAccountRepository },
    TransactionApplicationService,
    RecurringTemplateApplicationService,
    CreateRecurringSeriesUseCase,
    UpdateRecurringSeriesUseCase,
    ToggleRecurringPauseUseCase,
    SkipNextOccurrenceUseCase,
    DuplicateTransactionUseCase,
    MarkAsExceptionUseCase,
    DeleteRecurringSeriesUseCase,
    CreateTransferUseCase,
  ],
})
export class TransactionsModule {}
