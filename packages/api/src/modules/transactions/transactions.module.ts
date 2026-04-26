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

@Module({
  controllers: [TransactionsController],
  providers: [
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    { provide: RECURRING_TEMPLATE_REPOSITORY, useClass: PrismaRecurringTemplateRepository },
    TransactionApplicationService,
    RecurringTemplateApplicationService,
    CreateRecurringSeriesUseCase,
    UpdateRecurringSeriesUseCase,
    ToggleRecurringPauseUseCase,
    SkipNextOccurrenceUseCase,
    DuplicateTransactionUseCase,
    MarkAsExceptionUseCase,
  ],
})
export class TransactionsModule {}
