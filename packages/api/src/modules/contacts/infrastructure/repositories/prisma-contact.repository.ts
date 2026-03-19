import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { getPagination, type PaginatedResult } from "@/common/types/pagination.types"
import type { IContactRepository } from "../../application/ports/contact-repository.port"
import type {
  ContactRecord,
  CreateContactRecordInput,
  UpdateContactRecordInput,
  ContactFilters,
} from "../../domain/contact.types"

@Injectable()
export class PrismaContactRepository implements IContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string, userId: string): Promise<ContactRecord | null> {
    return this.prisma.contact.findFirst({ where: { id, userId } }) as Promise<ContactRecord | null>
  }

  async findMany(
    filters: ContactFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<ContactRecord>> {
    const { skip, take, page, pageSize } = getPagination(pagination)
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
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.contact.count({ where }),
    ])) as [ContactRecord[], number]

    return { data, total, page, pageSize }
  }

  create(data: CreateContactRecordInput): Promise<ContactRecord> {
    return this.prisma.contact.create({ data }) as Promise<ContactRecord>
  }

  async update(
    id: string,
    userId: string,
    data: UpdateContactRecordInput,
  ): Promise<ContactRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) {
      return null
    }

    return this.prisma.contact.update({ where: { id }, data }) as Promise<ContactRecord>
  }

  async delete(id: string, userId: string): Promise<ContactRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) {
      return null
    }

    return this.prisma.contact.delete({ where: { id } }) as Promise<ContactRecord>
  }
}
