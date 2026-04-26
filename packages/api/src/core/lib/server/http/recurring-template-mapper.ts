import type {
  RecurringTemplateRecord,
  RecurrenceFrequency,
  WeekOfMonth,
  DayOfWeekEnum,
} from "@/modules/transactions/domain/recurring-template.types"

function toClientFrequency(value: RecurrenceFrequency): "daily" | "weekly" | "monthly" | "yearly" {
  if (value === "DAILY") return "daily"
  if (value === "WEEKLY") return "weekly"
  if (value === "MONTHLY") return "monthly"
  return "yearly"
}

function toClientWeekOfMonth(
  value: WeekOfMonth | null,
): "first" | "second" | "third" | "fourth" | "last" | null {
  if (value == null) return null
  if (value === "FIRST") return "first"
  if (value === "SECOND") return "second"
  if (value === "THIRD") return "third"
  if (value === "FOURTH") return "fourth"
  return "last"
}

function toClientDayOfWeek(value: DayOfWeekEnum): string {
  return value.toLowerCase()
}

function toNumber(value: number | string | { toNumber(): number }): number {
  if (typeof value === "number") return value
  if (typeof value === "string") return parseFloat(value)
  return value.toNumber()
}

export function parseRecurrenceFrequency(value: unknown): RecurrenceFrequency | undefined {
  if (value == null) return undefined
  if (typeof value !== "string") throw new Error("Frequência da recorrência inválida")
  const normalized = value.trim().toUpperCase()
  if (normalized === "DAILY" || normalized === "WEEKLY" || normalized === "MONTHLY" || normalized === "YEARLY") {
    return normalized as RecurrenceFrequency
  }
  throw new Error("Frequência da recorrência inválida")
}

export function parseDayOfWeek(value: unknown): DayOfWeekEnum | undefined {
  if (value == null) return undefined
  if (typeof value !== "string") throw new Error("Dia da semana inválido")
  const normalized = value.trim().toUpperCase()
  const valid = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
  if (valid.includes(normalized)) return normalized as DayOfWeekEnum
  throw new Error("Dia da semana inválido")
}

export function parseWeekOfMonth(value: unknown): WeekOfMonth | undefined {
  if (value == null) return undefined
  if (typeof value !== "string") throw new Error("Semana do mês inválida")
  const normalized = value.trim().toUpperCase()
  if (normalized === "FIRST" || normalized === "SECOND" || normalized === "THIRD" || normalized === "FOURTH" || normalized === "LAST") {
    return normalized as WeekOfMonth
  }
  throw new Error("Semana do mês inválida")
}

export function mapRecurringTemplate(record: RecurringTemplateRecord) {
  return {
    id: record.id,
    userId: record.userId,
    frequency: toClientFrequency(record.frequency),
    interval: record.interval,
    daysOfWeek: record.daysOfWeek.map(toClientDayOfWeek),
    dayOfMonth: record.dayOfMonth,
    weekOfMonth: toClientWeekOfMonth(record.weekOfMonth),
    monthOfYear: record.monthOfYear,
    monthlyMode: record.monthlyMode,
    count: record.count,
    startDate: record.startDate.toISOString().split("T")[0] ?? record.startDate.toISOString(),
    endDate: record.endDate ? (record.endDate.toISOString().split("T")[0] ?? record.endDate.toISOString()) : null,
    paused: record.paused,
    pausedAt: record.pausedAt?.toISOString() ?? null,
    templateAmount: toNumber(record.templateAmount),
    templateDescription: record.templateDescription,
    templateNotes: record.templateNotes,
    templateType: record.templateType === "INCOME" ? "income" : "expense",
    templateCategoryId: record.templateCategoryId,
    templateContactId: record.templateContactId,
    templateAreaId: record.templateAreaId,
    templateCategoryGroupId: record.templateCategoryGroupId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}
