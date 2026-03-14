import { Module } from "@nestjs/common"
import { CategoriesController } from "./categories.controller"
import { CATEGORY_REPOSITORY } from "./application/ports/category-repository.port"
import { PrismaCategoryRepository } from "./infrastructure/repositories/prisma-category.repository"
import { CategoryApplicationService } from "./application/category.service"

@Module({
  controllers: [CategoriesController],
  providers: [
    { provide: CATEGORY_REPOSITORY, useClass: PrismaCategoryRepository },
    CategoryApplicationService,
  ],
})
export class CategoriesModule {}
