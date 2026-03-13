import { prisma } from "../db/prisma"
import { BaseRepository } from "./base-repository"

export interface LedgerEventRecord {
  id: string
  userId: string
  eventType: string
  entityType: string
  entityId: string
  payload?: unknown
  createdAt: Date
}

export interface CreateLedgerEventInput {
  userId: string
  eventType: string
  entityType: string
  entityId: string
  payload?: unknown
}

export class LedgerEventRepository extends BaseRepository {
  constructor(dbClient = prisma) {
    super(dbClient)
  }

  async create(data: CreateLedgerEventInput): Promise<LedgerEventRecord> {
    return this.prisma.ledgerEvent.create({ data }) as Promise<LedgerEventRecord>
  }
}
