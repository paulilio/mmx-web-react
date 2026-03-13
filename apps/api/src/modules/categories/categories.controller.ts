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
import { categoryService } from "@mmx/lib/server/services"
import {
  mapCategory,
  parseCategoryStatus,
  parseCategoryType,
} from "@mmx/lib/server/http/categories-mapper"

@Controller("categories")
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  @Get()
  async list(
    @AuthUser() userId: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("type") type?: string,
    @Query("status") status?: string,
    @Query("categoryGroupId") categoryGroupId?: string,
    @Query("areaId") areaId?: string,
  ) {
    const result = await categoryService.list(
      {
        userId,
        type: parseCategoryType(type ?? null),
        status: parseCategoryStatus(status ?? null),
        categoryGroupId,
        areaId,
      },
      {
        page: Number.isFinite(Number(page)) ? Number(page) : 1,
        pageSize: Number.isFinite(Number(pageSize)) ? Number(pageSize) : 20,
      },
    )
    return { ...result, data: result.data.map(mapCategory) }
  }

  @Get(":id")
  async getById(@AuthUser() userId: string, @Param("id") id: string) {
    const record = await categoryService.getById(id, userId)
    if (!record) throw Object.assign(new Error("Categoria nao encontrada"), { status: 404, code: "CATEGORY_NOT_FOUND" })
    return mapCategory(record)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AuthUser() userId: string,
    @Body() body: {
      name?: string
      description?: string | null
      type?: string
      categoryGroupId?: string | null
      areaId?: string | null
      status?: string
    },
  ) {
    if (!body.name || !body.type) {
      throw Object.assign(new Error("Campos obrigatorios: name, type"), { status: 400, code: "INVALID_INPUT" })
    }

    const created = await categoryService.create({
      userId,
      name: body.name,
      description: body.description,
      type: body.type,
      categoryGroupId: body.categoryGroupId,
      areaId: body.areaId,
      status: body.status,
    })
    return mapCategory(created)
  }

  @Put(":id")
  async update(
    @AuthUser() userId: string,
    @Param("id") id: string,
    @Body() body: {
      name?: string
      description?: string | null
      type?: string
      categoryGroupId?: string | null
      areaId?: string | null
      status?: string
    },
  ) {
    const updated = await categoryService.update(id, userId, {
      name: body.name,
      description: body.description,
      type: body.type ? parseCategoryType(body.type) ?? undefined : undefined,
      categoryGroupId: body.categoryGroupId,
      areaId: body.areaId,
      status: body.status ? parseCategoryStatus(body.status) ?? undefined : undefined,
    })
    return mapCategory(updated)
  }

  @Delete(":id")
  async remove(@AuthUser() userId: string, @Param("id") id: string) {
    const deleted = await categoryService.remove(id, userId)
    return mapCategory(deleted)
  }
}
