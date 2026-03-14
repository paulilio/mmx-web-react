import { Module } from "@nestjs/common"
import { TransactionsController } from "./transactions.controller"
import { TRANSACTION_REPOSITORY } from "./application/ports/transaction-repository.port"
import { PrismaTransactionRepository } from "./infrastructure/repositories/prisma-transaction.repository"
import { TransactionApplicationService } from "./application/transaction.service"

@Module({
  controllers: [TransactionsController],
  providers: [
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    TransactionApplicationService,
  ],
})
export class TransactionsModule {}
