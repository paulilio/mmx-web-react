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
import { contactService } from "@mmx/lib/server/services"
import {
  mapContact,
  parseContactStatus,
  parseContactType,
} from "@mmx/lib/server/http/contacts-mapper"

@Controller("contacts")
@UseGuards(JwtAuthGuard)
export class ContactsController {
  @Get()
  async list(
    @AuthUser() userId: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("type") type?: string,
    @Query("status") status?: string,
  ) {
    const result = await contactService.list(
      {
        userId,
        type: parseContactType(type),
        status: parseContactStatus(status),
      },
      {
        page: Number.isFinite(Number(page)) ? Number(page) : 1,
        pageSize: Number.isFinite(Number(pageSize)) ? Number(pageSize) : 20,
      },
    )
    return { ...result, data: result.data.map(mapContact) }
  }

  @Get(":id")
  async getById(@AuthUser() userId: string, @Param("id") id: string) {
    const record = await contactService.getById(id, userId)
    if (!record) throw Object.assign(new Error("Contato nao encontrado"), { status: 404, code: "CONTACT_NOT_FOUND" })
    return mapContact(record)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AuthUser() userId: string,
    @Body() body: {
      name?: string
      email?: string | null
      phone?: string | null
      identifier?: string | null
      document?: string | null
      type?: string
      status?: string
    },
  ) {
    if (!body.name || !body.type) {
      throw Object.assign(new Error("Campos obrigatorios: name, type"), { status: 400, code: "INVALID_INPUT" })
    }

    const created = await contactService.create({
      userId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      identifier: body.identifier ?? body.document,
      type: body.type,
      status: body.status,
    })
    return mapContact(created)
  }

  @Put(":id")
  async update(
    @AuthUser() userId: string,
    @Param("id") id: string,
    @Body() body: {
      name?: string
      email?: string | null
      phone?: string | null
      identifier?: string | null
      document?: string | null
      type?: string
      status?: string
    },
  ) {
    const updated = await contactService.update(id, userId, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      identifier: body.identifier ?? body.document,
      type: body.type ? parseContactType(body.type) : undefined,
      status: body.status ? parseContactStatus(body.status) : undefined,
    })
    return mapContact(updated)
  }

  @Delete(":id")
  async remove(@AuthUser() userId: string, @Param("id") id: string) {
    const deleted = await contactService.remove(id, userId)
    return mapContact(deleted)
  }
}
