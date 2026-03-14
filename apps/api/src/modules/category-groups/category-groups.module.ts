import { Module } from "@nestjs/common"
import { CategoryGroupsController } from "./category-groups.controller"
import { CATEGORY_GROUP_REPOSITORY } from "./application/ports/category-group-repository.port"
import { PrismaCategoryGroupRepository } from "./infrastructure/repositories/prisma-category-group.repository"
import { CategoryGroupApplicationService } from "./application/category-group.service"

@Module({
  controllers: [CategoryGroupsController],
  providers: [
    { provide: CATEGORY_GROUP_REPOSITORY, useClass: PrismaCategoryGroupRepository },
    CategoryGroupApplicationService,
  ],
})
export class CategoryGroupsModule {}
