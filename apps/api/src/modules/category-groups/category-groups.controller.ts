import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { AuthUser } from "../../common/decorators/auth-user.decorator"
import { categoryGroupService } from "@mmx/lib/server/services"
import {
  mapCategoryGroup,
  parseCategoryGroupStatus,
} from "@mmx/lib/server/http/category-groups-mapper"

@Controller("category-groups")
@UseGuards(JwtAuthGuard)
export class CategoryGroupsController {
  @Get()
  async list(
    @AuthUser() userId: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("status") status?: string,
    @Query("areaId") areaId?: string,
  ) {
    const result = await categoryGroupService.list(
      {
        userId,
        status: parseCategoryGroupStatus(status),
        areaId,
      },
      {
        page: Number.isFinite(Number(page)) ? Number(page) : 1,
        pageSize: Number.isFinite(Number(pageSize)) ? Number(pageSize) : 20,
      },
    )
    return { ...result, data: result.data.map(mapCategoryGroup) }
  }

  @Get(":id")
  async getById(@AuthUser() userId: string, @Param("id") id: string) {
    const record = await categoryGroupService.getById(id, userId)
    if (!record) throw Object.assign(new Error("Grupo de categoria nao encontrado"), { status: 404, code: "CATEGORY_GROUP_NOT_FOUND" })
    return mapCategoryGroup(record)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AuthUser() userId: string,
    @Body() body: {
      name?: string
      description?: string | null
      color?: string
      icon?: string
      areaId?: string | null
      status?: string
    },
  ) {
    if (!body.name) {
      throw Object.assign(new Error("Campo obrigatorio: name"), { status: 400, code: "INVALID_INPUT" })
    }

    const created = await categoryGroupService.create({
      userId,
      name: body.name,
      description: body.description,
      color: body.color ?? "#6366f1",
      icon: body.icon ?? "folder",
      areaId: body.areaId,
      status: body.status ? parseCategoryGroupStatus(body.status) : undefined,
    })
    return mapCategoryGroup(created)
  }

  @Put(":id")
  async update(
    @AuthUser() userId: string,
    @Param("id") id: string,
    @Body() body: {
      name?: string
      description?: string | null
      color?: string
      icon?: string
      areaId?: string | null
      status?: string
    },
  ) {
    const updated = await categoryGroupService.update(id, userId, {
      name: body.name,
      description: body.description,
      color: body.color,
      icon: body.icon,
      areaId: body.areaId,
      status: body.status ? parseCategoryGroupStatus(body.status) : undefined,
    })
    return mapCategoryGroup(updated)
  }

  @Delete(":id")
  async remove(@AuthUser() userId: string, @Param("id") id: string) {
    const deleted = await categoryGroupService.remove(id, userId)
    return mapCategoryGroup(deleted)
  }
}
