import { prisma } from "@/lib/server/db/prisma"
import type {
  DomainContactStatus,
  DomainContactType,
} from "@/lib/domain/contacts/contact-entity"
import { BaseRepository, type PaginatedResult } from "./base-repository"

export interface ContactRecord {
  id: string
  userId: string
  name: string
  email?: string | null
  phone?: string | null
  identifier?: string | null
  type: DomainContactType
  status: DomainContactStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateContactRecordInput {
  userId: string
  name: string
  email?: string | null
  phone?: string | null
  identifier?: string | null
  type: DomainContactType
  status: DomainContactStatus
}

export interface UpdateContactRecordInput {
  name?: string
  email?: string | null
  phone?: string | null
  identifier?: string | null
  type?: DomainContactType
  status?: DomainContactStatus
}

export interface ContactFilters {
  userId: string
  type?: DomainContactType
  status?: DomainContactStatus
  name?: string
}

export class ContactRepository extends BaseRepository {
  constructor(dbClient = prisma) {
    super(dbClient)
  }

  async findById(id: string, userId: string): Promise<ContactRecord | null> {
    return this.prisma.contact.findFirst({
      where: {
        id,
        userId,
      },
    }) as Promise<ContactRecord | null>
  }

  async findMany(
    filters: ContactFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<ContactRecord>> {
    const { skip, take, page, pageSize } = this.getPagination(pagination)

    const where = {
      userId: filters.userId,
      type: filters.type,
      status: filters.status,
      name: filters.name
        ? {
            contains: filters.name,
            mode: "insensitive" as const,
          }
        : undefined,
    }

    const [data, total] = (await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
      }),
      this.prisma.contact.count({ where }),
    ])) as [ContactRecord[], number]

    return this.toPaginatedResult(data, total, page, pageSize)
  }

  async create(data: CreateContactRecordInput): Promise<ContactRecord> {
    return this.prisma.contact.create({
      data,
    }) as Promise<ContactRecord>
  }

  async update(id: string, userId: string, data: UpdateContactRecordInput): Promise<ContactRecord | null> {
    const existing = await this.findById(id, userId)

    if (!existing) {
      return null
    }

    return this.prisma.contact.update({
      where: { id },
      data,
    }) as Promise<ContactRecord>
  }

  async delete(id: string, userId: string): Promise<ContactRecord | null> {
    const existing = await this.findById(id, userId)

    if (!existing) {
      return null
    }

    return this.prisma.contact.delete({
      where: { id },
    }) as Promise<ContactRecord>
  }
}
