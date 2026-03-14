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
import { AreaApplicationService } from "./application/area.service"
import {
  mapArea,
  parseAreaStatus,
  parseAreaType,
} from "@/core/lib/server/http/areas-mapper"

@Controller("areas")
@UseGuards(JwtAuthGuard)
export class AreasController {
  constructor(private readonly areaService: AreaApplicationService) {}
  @Get()
  async list(
    @AuthUser() userId: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("type") type?: string,
    @Query("status") status?: string,
  ) {
    const result = await this.areaService.list(
      {
        userId,
        type: parseAreaType(type),
        status: parseAreaStatus(status),
      },
      {
        page: Number.isFinite(Number(page)) ? Number(page) : 1,
        pageSize: Number.isFinite(Number(pageSize)) ? Number(pageSize) : 20,
      },
    )

    return { ...result, data: result.data.map(mapArea) }
  }

  @Get(":id")
  async getById(@AuthUser() userId: string, @Param("id") id: string) {
    const record = await this.areaService.getById(id, userId)
    if (!record) throw Object.assign(new Error("Area nao encontrada"), { status: 404, code: "AREA_NOT_FOUND" })
    return mapArea(record)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AuthUser() userId: string,
    @Body() body: {
      name?: string
      description?: string | null
      type?: string
      color?: string
      icon?: string
      status?: string
    },
  ) {
    if (!body.name || !body.type || !body.color || !body.icon) {
      throw Object.assign(new Error("Campos obrigatorios: name, type, color, icon"), { status: 400, code: "INVALID_INPUT" })
    }

    const created = await this.areaService.create({
      userId,
      name: body.name,
      description: body.description,
      type: body.type,
      color: body.color,
      icon: body.icon,
      status: body.status,
    })
    return mapArea(created)
  }

  @Put(":id")
  async update(
    @AuthUser() userId: string,
    @Param("id") id: string,
    @Body() body: {
      name?: string
      description?: string | null
      type?: string
      color?: string
      icon?: string
      status?: string
    },
  ) {
    const updated = await this.areaService.update(id, userId, {
      name: body.name,
      description: body.description,
      type: body.type ? parseAreaType(body.type) : undefined,
      color: body.color,
      icon: body.icon,
      status: body.status ? parseAreaStatus(body.status) : undefined,
    })
    return mapArea(updated)
  }

  @Delete(":id")
  async remove(@AuthUser() userId: string, @Param("id") id: string) {
    const deleted = await this.areaService.remove(id, userId)
    return mapArea(deleted)
  }
}
