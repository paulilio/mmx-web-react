import type {
  RecurrenceFrequency,
  DayOfWeekEnum,
} from "./recurring-template.types"

export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek?: DayOfWeekEnum[]
  dayOfMonth?: number | null
  monthlyMode?: string | null
  count?: number | null
  endDate?: Date | null
}

export interface GenerateRecurrenceDatesInput {
  startDate: Date
  rule: RecurrenceRule
}

const HARD_CAP = 120

const DAY_INDEX: Record<DayOfWeekEnum, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
}

function utcDate(year: number, monthZeroBased: number, day: number): Date {
  return new Date(Date.UTC(year, monthZeroBased, day))
}

function asUtcMidnight(date: Date): Date {
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function addDays(date: Date, days: number): Date {
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days)
}

function addMonthsClamped(date: Date, months: number): Date {
  const year = date.getUTCFullYear()
  const monthZeroBased = date.getUTCMonth()
  const day = date.getUTCDate()

  const targetYear = year + Math.floor((monthZeroBased + months) / 12)
  const normalizedTargetMonth = ((monthZeroBased + months) % 12 + 12) % 12

  // Clamp ao último dia do mês alvo (ex: 31/jan + 1 mês → 28/29 fev)
  const lastDayOfTargetMonth = utcDate(targetYear, normalizedTargetMonth + 1, 0).getUTCDate()
  const clampedDay = Math.min(day, lastDayOfTargetMonth)

  return utcDate(targetYear, normalizedTargetMonth, clampedDay)
}

function addYears(date: Date, years: number): Date {
  return addMonthsClamped(date, years * 12)
}

function isSameOrBefore(a: Date, b: Date): boolean {
  return a.getTime() <= b.getTime()
}

function pushIfWithinLimits(
  dates: Date[],
  candidate: Date,
  count: number | null | undefined,
  endDate: Date | null | undefined,
): "added" | "stop" {
  if (endDate && candidate.getTime() > endDate.getTime()) return "stop"
  dates.push(candidate)
  const cap = count ? Math.min(count, HARD_CAP) : HARD_CAP
  if (dates.length >= cap) return "stop"
  return "added"
}

export function generateRecurrenceDates({
  startDate,
  rule,
}: GenerateRecurrenceDatesInput): Date[] {
  if (rule.interval < 1) {
    throw new Error("interval da recorrência deve ser >= 1")
  }
  if (rule.count != null && rule.count < 1) {
    throw new Error("count da recorrência deve ser >= 1")
  }

  const start = asUtcMidnight(startDate)
  const endDate = rule.endDate ? asUtcMidnight(rule.endDate) : null
  const dates: Date[] = []

  if (rule.frequency === "DAILY") {
    let i = 0
    while (true) {
      const candidate = addDays(start, rule.interval * i)
      const result = pushIfWithinLimits(dates, candidate, rule.count, endDate)
      if (result === "stop") break
      i++
    }
    return dates
  }

  if (rule.frequency === "WEEKLY") {
    const weekdays =
      rule.daysOfWeek && rule.daysOfWeek.length > 0
        ? rule.daysOfWeek.map((d) => DAY_INDEX[d]).sort((a, b) => a - b)
        : [start.getUTCDay()]

    // Encontra o início da semana (domingo) que contém startDate
    const startWeekSunday = addDays(start, -start.getUTCDay())

    let weekOffset = 0
    while (true) {
      const weekStart = addDays(startWeekSunday, weekOffset * 7 * rule.interval)
      let stopped = false
      for (const weekday of weekdays) {
        const candidate = addDays(weekStart, weekday)
        if (isSameOrBefore(candidate, start) && candidate.getTime() < start.getTime()) {
          continue // pula datas anteriores ao start dentro da 1ª semana
        }
        const result = pushIfWithinLimits(dates, candidate, rule.count, endDate)
        if (result === "stop") {
          stopped = true
          break
        }
      }
      if (stopped) break
      weekOffset++
      if (weekOffset > HARD_CAP * 2) break // safety
    }
    return dates
  }

  if (rule.frequency === "MONTHLY") {
    let i = 0
    while (true) {
      const candidate = addMonthsClamped(start, rule.interval * i)
      const result = pushIfWithinLimits(dates, candidate, rule.count, endDate)
      if (result === "stop") break
      i++
    }
    return dates
  }

  if (rule.frequency === "YEARLY") {
    let i = 0
    while (true) {
      const candidate = addYears(start, rule.interval * i)
      const result = pushIfWithinLimits(dates, candidate, rule.count, endDate)
      if (result === "stop") break
      i++
    }
    return dates
  }

  throw new Error(`Frequência não suportada: ${rule.frequency as string}`)
}
