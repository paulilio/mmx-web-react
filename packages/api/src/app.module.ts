import { Module, MiddlewareConsumer, NestModule, RequestMethod } from "@nestjs/common"
import { CorsMiddleware } from "./common/middleware/cors.middleware"
import { SecurityHeadersMiddleware } from "./common/middleware/security-headers.middleware"
import { PrismaModule } from "./infrastructure/database/prisma/prisma.module"
import { HealthModule } from "./modules/health/health.module"
import { AuthModule } from "./modules/auth/auth.module"
import { TransactionsModule } from "./modules/transactions/transactions.module"
import { CategoriesModule } from "./modules/categories/categories.module"
import { CategoryGroupsModule } from "./modules/category-groups/category-groups.module"
import { ContactsModule } from "./modules/contacts/contacts.module"
import { AreasModule } from "./modules/areas/areas.module"
import { BudgetModule } from "./modules/budget/budget.module"
import { BudgetAllocationsModule } from "./modules/budget-allocations/budget-allocations.module"
import { ReportsModule } from "./modules/reports/reports.module"
import { SettingsModule } from "./modules/settings/settings.module"

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    TransactionsModule,
    CategoriesModule,
    CategoryGroupsModule,
    ContactsModule,
    AreasModule,
    BudgetModule,
    BudgetAllocationsModule,
    ReportsModule,
    SettingsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityHeadersMiddleware, CorsMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL })
  }
}
