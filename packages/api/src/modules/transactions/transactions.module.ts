import { Module } from "@nestjs/common"
import { TransactionsController } from "./transactions.controller"
import { TRANSACTION_REPOSITORY } from "./application/ports/transaction-repository.port"
import { RECURRING_TEMPLATE_REPOSITORY } from "./application/ports/recurring-template-repository.port"
import { PrismaTransactionRepository } from "./infrastructure/repositories/prisma-transaction.repository"
import { PrismaRecurringTemplateRepository } from "./infrastructure/repositories/prisma-recurring-template.repository"
import { TransactionApplicationService } from "./application/transaction.service"
import { RecurringTemplateApplicationService } from "./application/recurring-template.service"
import { CreateRecurringSeriesUseCase } from "./application/use-cases/create-recurring-series.use-case"

@Module({
  controllers: [TransactionsController],
  providers: [
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    { provide: RECURRING_TEMPLATE_REPOSITORY, useClass: PrismaRecurringTemplateRepository },
    TransactionApplicationService,
    RecurringTemplateApplicationService,
    CreateRecurringSeriesUseCase,
  ],
})
export class TransactionsModule {}
