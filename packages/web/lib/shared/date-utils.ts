export function formatDateToPtBR(date: string | Date): string {
  if (typeof date === "string") {
    // Handle ISO date string directly without Date object conversion
    if (date.includes("-")) {
      const [year, month, day] = date.split("-")
      if (year && month && day) {
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`
      }
    }
    // If it's already in pt-BR format, return as is
    if (date.includes("/")) {
      return date
    }
  }

  // Only use Date object for actual Date instances
  if (date instanceof Date) {
    if (isNaN(date.getTime())) return ""

    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  }

  return ""
}

export function parsePtBRDate(dateStr: string): Date | null {
  if (!dateStr) return null

  // Handle both dd/mm/yyyy and yyyy-mm-dd formats
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/")
    if (day && month && year) {
      // Create date at noon UTC to avoid timezone issues
      const date = new Date(Date.UTC(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day), 12, 0, 0))
      return isNaN(date.getTime()) ? null : date
    }
  } else if (dateStr.includes("-")) {
    const [year, month, day] = dateStr.split("-")
    if (year && month && day) {
      // Create date at noon UTC to avoid timezone issues
      const date = new Date(Date.UTC(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day), 12, 0, 0))
      return isNaN(date.getTime()) ? null : date
    }
  }

  return null
}

export function formatDateToISO(dateStr: string): string {
  if (!dateStr) return ""

  // If already in ISO format, return as is
  if (dateStr.includes("-") && dateStr.length === 10) {
    return dateStr
  }

  // Handle pt-BR format
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/")
    if (day && month && year) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }
  }

  return ""
}

export function isSameMonth(date1: string | Date | null | undefined, year: number, month: number): boolean {
  if (!date1) return false

  const dateObj = typeof date1 === "string" ? new Date(date1) : date1
  if (isNaN(dateObj.getTime())) return false

  return dateObj.getFullYear() === year && dateObj.getMonth() === month - 1
}

export function getMonthsWithTransactions(
  transactions: Array<{ date?: string | null }>,
): Array<{ year: number; month: number; label: string }> {
  const months = new Set<string>()

  transactions.forEach((transaction) => {
    if (transaction.date) {
      const date = new Date(transaction.date)
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        months.add(`${year}-${month}`)
      }
    }
  })

  return Array.from(months)
    .map((monthStr) => {
      const [rawYear, rawMonth] = monthStr.split("-").map(Number)
      const year = rawYear ?? 0
      const month = rawMonth ?? 0
      if (!Number.isFinite(year) || !Number.isFinite(month)) {
        return null
      }
      const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ]
      return {
        year,
        month,
        label: `${monthNames[month - 1] || ""} ${year}`,
      }
    })
    .filter((item): item is { year: number; month: number; label: string } => item !== null)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
}
