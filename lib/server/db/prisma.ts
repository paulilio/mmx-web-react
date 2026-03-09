import * as PrismaClientModule from "@prisma/client"

const PrismaClient = (PrismaClientModule as unknown as {
  PrismaClient: new (options?: {
    log?: Array<"query" | "info" | "warn" | "error">
  }) => unknown
}).PrismaClient

type Delegate = {
  findFirst: (args?: unknown) => Promise<unknown>
  findUnique: (args?: unknown) => Promise<unknown>
  findMany: (args?: unknown) => Promise<unknown>
  count: (args?: unknown) => Promise<number>
  create: (args?: unknown) => Promise<unknown>
  update: (args?: unknown) => Promise<unknown>
  delete: (args?: unknown) => Promise<unknown>
}

export interface DbClient {
  user: Delegate
  transaction: Delegate
  category: Delegate
  categoryGroup: Delegate
  contact: Delegate
  budget: Delegate
  budgetAllocation: Delegate
  area: Delegate
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: DbClient | undefined
}

// Reuse Prisma client in development to avoid exhausting connections during HMR.
export const prisma =
  global.prisma ??
  (new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  }) as DbClient)

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}
