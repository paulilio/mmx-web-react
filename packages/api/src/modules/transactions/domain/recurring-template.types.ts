import type { Prisma } from "@prisma/client"
import type { DomainTransactionType } from "./transaction-entity"

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
export type WeekOfMonth = "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "LAST"
export type DayOfWeekEnum =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"

export interface RecurringTemplateRecord {
  id: string
  userId: string
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek: DayOfWeekEnum[]
  dayOfMonth: number | null
  weekOfMonth: WeekOfMonth | null
  monthOfYear: number | null
  monthlyMode: string | null
  count: number | null
  startDate: Date
  endDate: Date | null
  paused: boolean
  pausedAt: Date | null
  templateAmount: number | string | Prisma.Decimal
  templateDescription: string
  templateNotes: string | null
  templateType: DomainTransactionType
  templateCategoryId: string
  templateContactId: string | null
  templateAreaId: string | null
  templateCategoryGroupId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateRecurringTemplateInput {
  userId: string
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek?: DayOfWeekEnum[]
  dayOfMonth?: number | null
  weekOfMonth?: WeekOfMonth | null
  monthOfYear?: number | null
  monthlyMode?: string | null
  count?: number | null
  startDate: Date
  endDate?: Date | null
  templateAmount: number
  templateDescription: string
  templateNotes?: string | null
  templateType: DomainTransactionType
  templateCategoryId: string
  templateContactId?: string | null
  templateAreaId?: string | null
  templateCategoryGroupId?: string | null
}

export interface UpdateRecurringTemplateInput {
  frequency?: RecurrenceFrequency
  interval?: number
  daysOfWeek?: DayOfWeekEnum[]
  dayOfMonth?: number | null
  weekOfMonth?: WeekOfMonth | null
  monthOfYear?: number | null
  monthlyMode?: string | null
  count?: number | null
  endDate?: Date | null
  paused?: boolean
  pausedAt?: Date | null
  templateAmount?: number
  templateDescription?: string
  templateNotes?: string | null
  templateType?: DomainTransactionType
  templateCategoryId?: string
  templateContactId?: string | null
  templateAreaId?: string | null
  templateCategoryGroupId?: string | null
}

export interface RecurringSeriesCounts {
  total: number
  pending: number
  completed: number
  cancelled: number
  skipped: number
}
