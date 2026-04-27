import { Module } from "@nestjs/common"
import { AccountsController } from "./accounts.controller"
import { ACCOUNT_REPOSITORY } from "./application/ports/account-repository.port"
import { PrismaAccountRepository } from "./infrastructure/repositories/prisma-account.repository"
import { AccountApplicationService } from "./application/account.service"

@Module({
  controllers: [AccountsController],
  providers: [
    { provide: ACCOUNT_REPOSITORY, useClass: PrismaAccountRepository },
    AccountApplicationService,
  ],
  exports: [AccountApplicationService],
})
export class AccountsModule {}
