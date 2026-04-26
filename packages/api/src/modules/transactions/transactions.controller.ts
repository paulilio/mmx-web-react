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
import { TransactionApplicationService } from "./application/transaction.service"
import {
  mapTransaction,
  parseTransactionStatus,
  parseTransactionType,
} from "@/core/lib/server/http/transactions-mapper"

@Controller("transactions")
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionService: TransactionApplicationService) {}
  @Get()
  async list(
    @AuthUser() userId: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("type") type?: string,
    @Query("status") status?: string,
    @Query("categoryId") categoryId?: string,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
  ) {
    const pageNum = Number.isFinite(Number(page)) ? Number(page) : 1
    const pageSizeNum = Number.isFinite(Number(pageSize)) ? Number(pageSize) : 20

    const result = await this.transactionService.list(
      {
        userId,
        type: parseTransactionType(type ?? null),
        status: parseTransactionStatus(status ?? null),
        categoryId,
        dateFrom,
        dateTo,
      },
      { page: pageNum, pageSize: pageSizeNum },
    )

    return { ...result, data: result.data.map(mapTransaction) }
  }

  @Get(":id")
  async getById(@AuthUser() userId: string, @Param("id") id: string) {
    const record = await this.transactionService.getById(id, userId)
    if (!record) throw Object.assign(new Error("Transacao nao encontrada"), { status: 404, code: "TRANSACTION_NOT_FOUND" })
    return mapTransaction(record)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AuthUser() userId: string,
    @Body() body: {
      description?: string
      amount?: number
      type?: string
      categoryId?: string
      date?: string
      status?: string
      notes?: string | null
      contactId?: string | null
      areaId?: string | null
      categoryGroupId?: string | null
      recurrence?: unknown
      currentBalance?: number
    },
  ) {
    if (!body.date || !body.type || !body.categoryId) {
      throw Object.assign(new Error("Campos obrigatorios: date, type, categoryId"), { status: 400, code: "INVALID_INPUT" })
    }

    const parsedType = parseTransactionType(body.type)
    if (!parsedType) throw Object.assign(new Error("Tipo da transacao invalido"), { status: 400, code: "INVALID_INPUT" })

    const created = await this.transactionService.create(
      {
        userId,
        description: body.description ?? "",
        amount: Number(body.amount ?? 0),
        type: parsedType,
        categoryId: body.categoryId,
        date: body.date,
        status: parseTransactionStatus(body.status ?? null),
        notes: body.notes,
        contactId: body.contactId,
        areaId: body.areaId,
        categoryGroupId: body.categoryGroupId,
        recurrence: body.recurrence,
      },
      body.currentBalance,
    )

    return mapTransaction(created)
  }

  @Put(":id")
  async update(
    @AuthUser() userId: string,
    @Param("id") id: string,
    @Body() body: {
      description?: string
      amount?: number
      type?: string
      categoryId?: string
      date?: string
      status?: string
      notes?: string | null
      contactId?: string | null
      areaId?: string | null
      categoryGroupId?: string | null
      recurrence?: unknown
      currentBalance?: number
    },
  ) {
    const updated = await this.transactionService.update(
      id,
      userId,
      {
        description: body.description,
        amount: body.amount !== undefined ? Number(body.amount) : undefined,
        type: body.type ? parseTransactionType(body.type) ?? undefined : undefined,
        categoryId: body.categoryId,
        date: body.date,
        status: body.status ? parseTransactionStatus(body.status) ?? undefined : undefined,
        notes: body.notes,
        contactId: body.contactId,
        areaId: body.areaId,
        categoryGroupId: body.categoryGroupId,
        recurrence: body.recurrence,
      },
      body.currentBalance,
    )
    return mapTransaction(updated)
  }

  @Delete(":id")
  async remove(@AuthUser() userId: string, @Param("id") id: string) {
    const deleted = await this.transactionService.remove(id, userId)
    return mapTransaction(deleted)
  }
}
