import { Injectable } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import type {
  IRecurringTemplateRepository,
  CreateRecurringSeriesData,
} from "../../application/ports/recurring-template-repository.port"
import type {
  RecurringTemplateRecord,
  UpdateRecurringTemplateInput,
  RecurringSeriesCounts,
} from "../../domain/recurring-template.types"
import type {
  TransactionRecord,
  CreateTransactionRecordInput,
} from "../../domain/transaction.types"

function toPrismaCreateTransaction(
  data: CreateTransactionRecordInput & { templateId?: string; seriesIndex?: number },
): Prisma.TransactionUncheckedCreateInput {
  const { recurrence, ...rest } = data
  const out: Prisma.TransactionUncheckedCreateInput = { ...rest }
  if (recurrence !== undefined) {
    out.recurrence =
      recurrence === null
        ? Prisma.JsonNull
        : (recurrence as Prisma.InputJsonValue)
  }
  return out
}

@Injectable()
export class PrismaRecurringTemplateRepository implements IRecurringTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string, userId: string): Promise<RecurringTemplateRecord | null> {
    return this.prisma.recurringTemplate.findFirst({
      where: { id, userId },
    }) as Promise<RecurringTemplateRecord | null>
  }

  findExecutions(templateId: string, userId: string): Promise<TransactionRecord[]> {
    return this.prisma.transaction.findMany({
      where: {
        templateId,
        userId,
        deletedAt: null,
      },
      orderBy: { date: "asc" },
    }) as Promise<TransactionRecord[]>
  }

  async countExecutionsByStatus(
    templateId: string,
    userId: string,
  ): Promise<RecurringSeriesCounts> {
    const rows = await this.prisma.transaction.groupBy({
      by: ["status"],
      where: { templateId, userId, deletedAt: null },
      _count: { _all: true },
    })

    const skippedCount = await this.prisma.transaction.count({
      where: { templateId, userId, deletedAt: null, skipped: true },
    })

    const counts: RecurringSeriesCounts = {
      total: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      skipped: skippedCount,
    }
    for (const row of rows) {
      const n = row._count._all
      counts.total += n
      if (row.status === "PENDING") counts.pending = n
      if (row.status === "COMPLETED") counts.completed = n
      if (row.status === "CANCELLED") counts.cancelled = n
    }
    return counts
  }

  async createSeries(
    data: CreateRecurringSeriesData,
  ): Promise<{ template: RecurringTemplateRecord; executions: TransactionRecord[] }> {
    const { template: templateInput, executions } = data

    return (await this.prisma.$transaction(async (tx) => {
      const template = (await tx.recurringTemplate.create({
        data: {
          userId: templateInput.userId,
          frequency: templateInput.frequency,
          interval: templateInput.interval,
          daysOfWeek: templateInput.daysOfWeek ?? [],
          dayOfMonth: templateInput.dayOfMonth ?? null,
          weekOfMonth: templateInput.weekOfMonth ?? null,
          monthOfYear: templateInput.monthOfYear ?? null,
          monthlyMode: templateInput.monthlyMode ?? null,
          count: templateInput.count ?? null,
          startDate: templateInput.startDate,
          endDate: templateInput.endDate ?? null,
          templateAmount: new Prisma.Decimal(templateInput.templateAmount),
          templateDescription: templateInput.templateDescription,
          templateNotes: templateInput.templateNotes ?? null,
          templateType: templateInput.templateType,
          templateCategoryId: templateInput.templateCategoryId,
          templateContactId: templateInput.templateContactId ?? null,
          templateAreaId: templateInput.templateAreaId ?? null,
          templateCategoryGroupId: templateInput.templateCategoryGroupId ?? null,
        },
      })) as RecurringTemplateRecord

      const created: TransactionRecord[] = []
      for (let i = 0; i < executions.length; i++) {
        const exec = executions[i]
        const seriesIndex = i + 1
        const record = (await tx.transaction.create({
          data: toPrismaCreateTransaction({
            ...exec,
            templateId: template.id,
            seriesIndex,
          }),
        })) as TransactionRecord
        created.push(record)
      }

      return { template, executions: created }
    }, { timeout: 30_000 })) as {
      template: RecurringTemplateRecord
      executions: TransactionRecord[]
    }
  }

  async update(
    id: string,
    userId: string,
    data: UpdateRecurringTemplateInput,
  ): Promise<RecurringTemplateRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) return null

    const updateData: Prisma.RecurringTemplateUpdateInput = {}
    if (data.frequency !== undefined) updateData.frequency = data.frequency
    if (data.interval !== undefined) updateData.interval = data.interval
    if (data.daysOfWeek !== undefined) updateData.daysOfWeek = data.daysOfWeek
    if (data.dayOfMonth !== undefined) updateData.dayOfMonth = data.dayOfMonth
    if (data.weekOfMonth !== undefined) updateData.weekOfMonth = data.weekOfMonth
    if (data.monthOfYear !== undefined) updateData.monthOfYear = data.monthOfYear
    if (data.monthlyMode !== undefined) updateData.monthlyMode = data.monthlyMode
    if (data.count !== undefined) updateData.count = data.count
    if (data.endDate !== undefined) updateData.endDate = data.endDate
    if (data.paused !== undefined) updateData.paused = data.paused
    if (data.pausedAt !== undefined) updateData.pausedAt = data.pausedAt
    if (data.templateAmount !== undefined)
      updateData.templateAmount = new Prisma.Decimal(data.templateAmount)
    if (data.templateDescription !== undefined)
      updateData.templateDescription = data.templateDescription
    if (data.templateNotes !== undefined) updateData.templateNotes = data.templateNotes
    if (data.templateType !== undefined) updateData.templateType = data.templateType
    if (data.templateCategoryId !== undefined)
      updateData.templateCategoryId = data.templateCategoryId
    if (data.templateContactId !== undefined)
      updateData.templateContactId = data.templateContactId
    if (data.templateAreaId !== undefined) updateData.templateAreaId = data.templateAreaId
    if (data.templateCategoryGroupId !== undefined)
      updateData.templateCategoryGroupId = data.templateCategoryGroupId

    return this.prisma.recurringTemplate.update({
      where: { id },
      data: updateData,
    }) as Promise<RecurringTemplateRecord>
  }

  async delete(id: string, userId: string): Promise<RecurringTemplateRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) return null
    return this.prisma.recurringTemplate.delete({
      where: { id },
    }) as Promise<RecurringTemplateRecord>
  }

  async updateExecutions(
    templateId: string,
    userId: string,
    options: { fromDate?: Date; preserveExceptions?: boolean },
    patch: Parameters<IRecurringTemplateRepository["updateExecutions"]>[3],
  ): Promise<number> {
    const where: Prisma.TransactionWhereInput = {
      templateId,
      userId,
      deletedAt: null,
    }
    if (options.fromDate) where.date = { gte: options.fromDate }
    if (options.preserveExceptions !== false) where.isException = false

    const data: Prisma.TransactionUpdateManyMutationInput = {}
    if (patch.description !== undefined) data.description = patch.description
    if (patch.amount !== undefined) data.amount = new Prisma.Decimal(patch.amount)
    if (patch.type !== undefined) data.type = patch.type
    if (patch.categoryId !== undefined) data.categoryId = patch.categoryId
    if (patch.contactId !== undefined) data.contactId = patch.contactId
    if (patch.status !== undefined) data.status = patch.status
    if (patch.notes !== undefined) data.notes = patch.notes
    if (patch.areaId !== undefined) data.areaId = patch.areaId
    if (patch.categoryGroupId !== undefined) data.categoryGroupId = patch.categoryGroupId

    const result = await this.prisma.transaction.updateMany({ where, data })
    return result.count
  }

  async deleteExecutions(
    templateId: string,
    userId: string,
    options: { fromDate?: Date; onlyId?: string },
  ): Promise<number> {
    const where: Prisma.TransactionWhereInput = {
      templateId,
      userId,
      deletedAt: null,
    }
    if (options.onlyId) where.id = options.onlyId
    if (options.fromDate) where.date = { gte: options.fromDate }

    const result = await this.prisma.transaction.updateMany({
      where,
      data: { deletedAt: new Date() },
    })
    return result.count
  }
}
