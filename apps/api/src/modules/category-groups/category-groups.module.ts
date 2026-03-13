import { Module } from "@nestjs/common"
import { CategoryGroupsController } from "./category-groups.controller"

@Module({ controllers: [CategoryGroupsController] })
export class CategoryGroupsModule {}
