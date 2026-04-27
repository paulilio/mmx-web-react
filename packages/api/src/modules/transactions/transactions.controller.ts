import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { RecurringTemplateApplicationService } from "./application/recurring-template.service"
import { CreateRecurringSeriesUseCase } from "./application/use-cases/create-recurring-series.use-case"
import { UpdateRecurringSeriesUseCase } from "./application/use-cases/update-recurring-series.use-case"
import { ToggleRecurringPauseUseCase } from "./application/use-cases/toggle-recurring-pause.use-case"
import { SkipNextOccurrenceUseCase } from "./application/use-cases/skip-next-occurrence.use-case"
import { DuplicateTransactionUseCase } from "./application/use-cases/duplicate-transaction.use-case"
import { MarkAsExceptionUseCase } from "./application/use-cases/mark-as-exception.use-case"
import { DeleteRecurringSeriesUseCase } from "./application/use-cases/delete-recurring-series.use-case"
import { CreateTransferUseCase } from "./application/use-cases/create-transfer.use-case"
import {
  mapTransaction,
  parseTransactionStatus,
  parseTransactionType,
} from "@/core/lib/server/http/transactions-mapper"
import {
  mapRecurringTemplate,
  parseRecurrenceFrequency,
  parseDayOfWeek,
  parseWeekOfMonth,
} from "@/core/lib/server/http/recurring-template-mapper"

@Controller("transactions")
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private readonly transactionService: TransactionApplicationService,
    private readonly recurringService: RecurringTemplateApplicationService,
    private readonly createRecurringSeries: CreateRecurringSeriesUseCase,
    private readonly updateRecurringSeries: UpdateRecurringSeriesUseCase,
    private readonly togglePause: ToggleRecurringPauseUseCase,
    private readonly skipNext: SkipNextOccurrenceUseCase,
    private readonly duplicate: DuplicateTransactionUseCase,
    private readonly markAsException: MarkAsExceptionUseCase,
    private readonly deleteRecurringSeries: DeleteRecurringSeriesUseCase,
    private readonly createTransferUseCase: CreateTransferUseCase,
  ) {}
  @Get()
  async list(
    @AuthUser() userId: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("type") type?: string,
    @Query("status") status?: string,
    @Query("categoryId") categoryId?: string,
    @Query("accountId") accountId?: string,
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
        accountId,
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
      accountId?: string
      recurrence?: unknown
      currentBalance?: number
    },
  ) {
    if (!body.date || !body.type) {
      throw Object.assign(new Error("Campos obrigatorios: date, type"), { status: 400, code: "INVALID_INPUT" })
    }

    if (!body.accountId) {
      throw Object.assign(new Error("accountId obrigatorio"), { status: 400, code: "MISSING_ACCOUNT" })
    }

    const parsedType = parseTransactionType(body.type)
    if (!parsedType) throw Object.assign(new Error("Tipo da transacao invalido"), { status: 400, code: "INVALID_INPUT" })

    if (parsedType === "TRANSFER") {
      throw Object.assign(new Error("Use POST /transactions/transfer para criar transferencias"), { status: 400, code: "USE_TRANSFER_ENDPOINT" })
    }

    if (!body.categoryId) {
      throw Object.assign(new Error("categoryId obrigatorio para INCOME/EXPENSE"), { status: 400, code: "INVALID_INPUT" })
    }

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
        accountId: body.accountId,
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
      accountId?: string
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
        accountId: body.accountId,
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

  @Post("transfer")
  @HttpCode(HttpStatus.CREATED)
  async createTransfer(
    @AuthUser() userId: string,
    @Body() body: {
      fromAccountId?: string
      toAccountId?: string
      amount?: number
      date?: string
      description?: string
      notes?: string | null
      transferKind?: string | null
      status?: "PENDING" | "COMPLETED"
    },
  ) {
    if (!body.fromAccountId || !body.toAccountId || !body.date || body.amount == null) {
      throw Object.assign(
        new Error("Campos obrigatorios: fromAccountId, toAccountId, amount, date"),
        { status: 400, code: "INVALID_INPUT" },
      )
    }

    const result = await this.createTransferUseCase.execute({
      userId,
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      amount: Number(body.amount),
      date: body.date,
      description: body.description ?? "",
      notes: body.notes ?? null,
      transferKind: body.transferKind ?? null,
      status: body.status ?? "PENDING",
    })

    return {
      transferGroupId: result.transferGroupId,
      debit: mapTransaction(result.debit),
      credit: mapTransaction(result.credit),
    }
  }

  @Post("recurring")
  @HttpCode(HttpStatus.CREATED)
  async createRecurringSeriesEndpoint(
    @AuthUser() userId: string,
    @Body() body: {
      template?: {
        frequency?: string
        interval?: number
        daysOfWeek?: string[]
        dayOfMonth?: number | null
        weekOfMonth?: string | null
        monthOfYear?: number | null
        monthlyMode?: string | null
        count?: number | null
        startDate?: string
        endDate?: string | null
      }
      base?: {
        description?: string
        amount?: number
        type?: string
        categoryId?: string
        contactId?: string | null
        status?: string
        notes?: string | null
        areaId?: string | null
        categoryGroupId?: string | null
        accountId?: string
      }
    },
  ) {
    if (!body?.template || !body?.base) {
      throw Object.assign(new Error("template e base são obrigatórios"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }
    const t = body.template
    const b = body.base

    if (!t.frequency || !t.startDate) {
      throw Object.assign(new Error("template.frequency e template.startDate são obrigatórios"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }
    if (!b.type || !b.categoryId) {
      throw Object.assign(new Error("base.type e base.categoryId são obrigatórios"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }
    if (!b.accountId) {
      throw Object.assign(new Error("base.accountId é obrigatório"), {
        status: 400,
        code: "MISSING_ACCOUNT",
      })
    }

    const frequency = parseRecurrenceFrequency(t.frequency)
    if (!frequency) {
      throw Object.assign(new Error("template.frequency inválido"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }
    const baseType = parseTransactionType(b.type)
    if (!baseType) {
      throw Object.assign(new Error("base.type inválido"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }
    const baseStatus = parseTransactionStatus(b.status ?? null) ?? "PENDING"

    const daysOfWeek = (t.daysOfWeek ?? [])
      .map((d) => parseDayOfWeek(d))
      .filter((d): d is NonNullable<typeof d> => d !== undefined)

    const weekOfMonth = t.weekOfMonth ? parseWeekOfMonth(t.weekOfMonth) ?? null : null

    const startDate = new Date(t.startDate)
    if (Number.isNaN(startDate.getTime())) {
      throw Object.assign(new Error("template.startDate inválido"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }
    const endDate = t.endDate ? new Date(t.endDate) : null
    if (endDate && Number.isNaN(endDate.getTime())) {
      throw Object.assign(new Error("template.endDate inválido"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }

    const baseAmount = Number(b.amount ?? 0)

    const result = await this.createRecurringSeries.execute({
      userId,
      template: {
        userId,
        frequency,
        interval: Number(t.interval ?? 1),
        daysOfWeek,
        dayOfMonth: t.dayOfMonth ?? null,
        weekOfMonth,
        monthOfYear: t.monthOfYear ?? null,
        monthlyMode: t.monthlyMode ?? null,
        count: t.count ?? null,
        startDate,
        endDate,
        templateAmount: baseAmount,
        templateDescription: b.description ?? "",
        templateNotes: b.notes ?? null,
        templateType: baseType,
        templateCategoryId: b.categoryId,
        templateContactId: b.contactId ?? null,
        templateAreaId: b.areaId ?? null,
        templateCategoryGroupId: b.categoryGroupId ?? null,
      },
      base: {
        description: b.description ?? "",
        amount: baseAmount,
        type: baseType,
        categoryId: b.categoryId,
        contactId: b.contactId ?? null,
        status: baseStatus,
        notes: b.notes ?? null,
        areaId: b.areaId ?? null,
        categoryGroupId: b.categoryGroupId ?? null,
        accountId: b.accountId,
      },
    })

    return {
      template: mapRecurringTemplate(result.template),
      executions: result.executions.map(mapTransaction),
    }
  }

  @Get("recurring/:templateId")
  async getRecurringSeries(
    @AuthUser() userId: string,
    @Param("templateId") templateId: string,
  ) {
    const view = await this.recurringService.getSeries(templateId, userId)
    if (!view) {
      throw Object.assign(new Error("Série de recorrência não encontrada"), {
        status: 404,
        code: "RECURRING_TEMPLATE_NOT_FOUND",
      })
    }
    return {
      template: mapRecurringTemplate(view.template),
      executions: view.executions.map(mapTransaction),
      counts: view.counts,
    }
  }

  @Patch("recurring/:templateId")
  async updateRecurringSeriesEndpoint(
    @AuthUser() userId: string,
    @Param("templateId") templateId: string,
    @Body() body: {
      applyMode?: "future" | "all"
      fromDate?: string
      patch?: {
        description?: string
        amount?: number
        type?: string
        categoryId?: string
        contactId?: string | null
        status?: string
        notes?: string | null
        areaId?: string | null
        categoryGroupId?: string | null
      }
    },
  ) {
    const applyMode = body.applyMode ?? "all"
    if (applyMode !== "future" && applyMode !== "all") {
      throw Object.assign(new Error("applyMode deve ser future|all"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }
    const fromDate = body.fromDate ? new Date(body.fromDate) : undefined
    if (fromDate && Number.isNaN(fromDate.getTime())) {
      throw Object.assign(new Error("fromDate inválido"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }
    const p = body.patch ?? {}
    const result = await this.updateRecurringSeries.execute({
      userId,
      templateId,
      applyMode,
      fromDate,
      patch: {
        description: p.description,
        amount: p.amount !== undefined ? Number(p.amount) : undefined,
        type: p.type ? parseTransactionType(p.type) ?? undefined : undefined,
        categoryId: p.categoryId,
        contactId: p.contactId,
        status: p.status ? parseTransactionStatus(p.status) ?? undefined : undefined,
        notes: p.notes,
        areaId: p.areaId,
        categoryGroupId: p.categoryGroupId,
      },
    })
    return { updated: result.updated, template: mapRecurringTemplate(result.template) }
  }

  @Patch("recurring/:templateId/pause")
  async pauseRecurringSeries(
    @AuthUser() userId: string,
    @Param("templateId") templateId: string,
    @Body() body: { paused?: boolean },
  ) {
    if (typeof body.paused !== "boolean") {
      throw Object.assign(new Error("paused deve ser boolean"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }
    const template = await this.togglePause.execute(userId, templateId, body.paused)
    return { template: mapRecurringTemplate(template) }
  }

  @Post(":id/skip")
  @HttpCode(HttpStatus.OK)
  async skipNextOccurrence(
    @AuthUser() userId: string,
    @Param("id") id: string,
  ) {
    const tx = await this.skipNext.execute(userId, id)
    return mapTransaction(tx)
  }

  @Post(":id/duplicate")
  @HttpCode(HttpStatus.CREATED)
  async duplicateTransaction(
    @AuthUser() userId: string,
    @Param("id") id: string,
    @Body() body: { date?: string },
  ) {
    const tx = await this.duplicate.execute(userId, id, { date: body?.date })
    return mapTransaction(tx)
  }

  @Delete("recurring/:templateId")
  async deleteRecurringSeriesEndpoint(
    @AuthUser() userId: string,
    @Param("templateId") templateId: string,
    @Query("applyMode") applyMode?: string,
    @Query("fromTransactionId") fromTransactionId?: string,
  ) {
    const mode = (applyMode ?? "all") as "single" | "future" | "all"
    if (mode !== "single" && mode !== "future" && mode !== "all") {
      throw Object.assign(new Error("applyMode deve ser single|future|all"), {
        status: 400,
        code: "INVALID_INPUT",
      })
    }
    return this.deleteRecurringSeries.execute({
      userId,
      templateId,
      applyMode: mode,
      fromTransactionId,
    })
  }

  @Patch(":id/exception")
  async markAsExceptionEndpoint(
    @AuthUser() userId: string,
    @Param("id") id: string,
    @Body() body: {
      description?: string
      amount?: number
      type?: string
      categoryId?: string
      contactId?: string | null
      date?: string
      status?: string
      notes?: string | null
      areaId?: string | null
      categoryGroupId?: string | null
    },
  ) {
    const tx = await this.markAsException.execute({
      userId,
      transactionId: id,
      patch: {
        description: body.description,
        amount: body.amount !== undefined ? Number(body.amount) : undefined,
        type: body.type ? parseTransactionType(body.type) ?? undefined : undefined,
        categoryId: body.categoryId,
        contactId: body.contactId,
        date: body.date,
        status: body.status ? parseTransactionStatus(body.status) ?? undefined : undefined,
        notes: body.notes,
        areaId: body.areaId,
        categoryGroupId: body.categoryGroupId,
      },
    })
    return mapTransaction(tx)
  }
}
