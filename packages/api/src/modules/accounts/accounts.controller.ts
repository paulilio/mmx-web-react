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
import { AccountApplicationService } from "./application/account.service"
import {
  mapAccount,
  mapAccountBalance,
  parseAccountStatus,
  parseAccountType,
} from "@/core/lib/server/http/accounts-mapper"

interface CreateAccountBody {
  name?: string
  institutionName?: string | null
  type?: string
  status?: string
  currency?: string
  openingBalance?: number
  openingBalanceDate?: string
  color?: string | null
  icon?: string | null
  creditLimit?: number | null
  closingDay?: number | null
  dueDay?: number | null
}

interface UpdateAccountBody {
  name?: string
  institutionName?: string | null
  type?: string
  status?: string
  currency?: string
  openingBalance?: number
  openingBalanceDate?: string
  color?: string | null
  icon?: string | null
  creditLimit?: number | null
  closingDay?: number | null
  dueDay?: number | null
}

@Controller("accounts")
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountService: AccountApplicationService) {}

  @Get()
  async list(
    @AuthUser() userId: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("type") type?: string,
    @Query("status") status?: string,
  ) {
    const result = await this.accountService.list(
      {
        userId,
        type: parseAccountType(type),
        status: parseAccountStatus(status),
      },
      {
        page: Number.isFinite(Number(page)) ? Number(page) : 1,
        pageSize: Number.isFinite(Number(pageSize)) ? Number(pageSize) : 20,
      },
    )

    return { ...result, data: result.data.map(mapAccount) }
  }

  @Get(":id")
  async getById(@AuthUser() userId: string, @Param("id") id: string) {
    const record = await this.accountService.getById(id, userId)
    if (!record) {
      throw Object.assign(new Error("Conta nao encontrada"), { status: 404, code: "ACCOUNT_NOT_FOUND" })
    }
    return mapAccount(record)
  }

  @Get(":id/balance")
  async getBalance(@AuthUser() userId: string, @Param("id") id: string) {
    const balance = await this.accountService.getBalance(id, userId)
    return mapAccountBalance(balance)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@AuthUser() userId: string, @Body() body: CreateAccountBody) {
    if (!body.name || !body.type) {
      throw Object.assign(new Error("Campos obrigatorios: name, type"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }

    const created = await this.accountService.create({
      userId,
      name: body.name,
      institutionName: body.institutionName,
      type: body.type,
      status: body.status,
      currency: body.currency,
      openingBalance: body.openingBalance,
      openingBalanceDate: body.openingBalanceDate,
      color: body.color,
      icon: body.icon,
      creditLimit: body.creditLimit,
      closingDay: body.closingDay,
      dueDay: body.dueDay,
    })

    return mapAccount(created)
  }

  @Put(":id")
  async update(
    @AuthUser() userId: string,
    @Param("id") id: string,
    @Body() body: UpdateAccountBody,
  ) {
    const updated = await this.accountService.update(id, userId, {
      name: body.name,
      institutionName: body.institutionName,
      type: body.type,
      status: body.status,
      currency: body.currency,
      openingBalance: body.openingBalance,
      openingBalanceDate: body.openingBalanceDate,
      color: body.color,
      icon: body.icon,
      creditLimit: body.creditLimit,
      closingDay: body.closingDay,
      dueDay: body.dueDay,
    })

    return mapAccount(updated)
  }

  @Delete(":id")
  async remove(@AuthUser() userId: string, @Param("id") id: string) {
    const archived = await this.accountService.archive(id, userId)
    return mapAccount(archived)
  }
}
