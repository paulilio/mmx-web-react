export type TimedTokenRecord = {
  email: string
  token?: string
  code?: string
  expiresAt: string
  used?: boolean
  createdAt?: string
  userId?: string
}

function randomChunk(size: number): string {
  return Math.random().toString(36).substring(2, 2 + size).toUpperCase()
}

export function generateConfirmationCode(): string {
  return `XPX-${randomChunk(4)}`
}

export function generateResetToken(): string {
  return `RST-${randomChunk(6)}`
}

export function findLatestActiveValue(
  records: TimedTokenRecord[],
  email: string,
  field: "token" | "code",
  now = new Date(),
): string | null {
  const candidates = records
    .filter((record) => record.email === email)
    .filter((record) => !record.used)
    .filter((record) => new Date(record.expiresAt) > now)
    .sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime()
      const bTime = new Date(b.createdAt || 0).getTime()
      return bTime - aTime
    })

  const value = candidates[0]?.[field]
  return typeof value === "string" ? value : null
}

export function consumeTimedValue(
  records: TimedTokenRecord[],
  email: string,
  input: string,
  field: "token" | "code",
  now = new Date(),
): { valid: boolean; updatedRecords: TimedTokenRecord[] } {
  let found = false

  const updatedRecords = records.map((record) => {
    if (record.email !== email) return record
    if (record.used) return record
    if (new Date(record.expiresAt) <= now) return record
    if ((record[field] || "") !== input) return record
    found = true
    return { ...record, used: true }
  })

  return { valid: found, updatedRecords }
}
