import { prisma } from "@/lib/server/db/prisma"
import { BaseRepository } from "./base-repository"

export interface UserRecord {
  id: string
  email: string
  passwordHash?: string | null
  firstName: string
  lastName: string
  phone?: string | null
  cpfCnpj?: string | null
  isEmailConfirmed: boolean
  defaultOrganizationId?: string | null
  planType: "FREE" | "PREMIUM" | "PRO"
  profilePhoto?: string | null
  preferences?: unknown
  lastLogin?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserRecordInput {
  email: string
  passwordHash?: string | null
  firstName: string
  lastName: string
  phone?: string | null
  cpfCnpj?: string | null
  isEmailConfirmed?: boolean
  defaultOrganizationId?: string | null
  planType?: "FREE" | "PREMIUM" | "PRO"
  profilePhoto?: string | null
  preferences?: unknown
  lastLogin?: Date | null
}

export interface UpdateUserRecordInput {
  email?: string
  passwordHash?: string | null
  firstName?: string
  lastName?: string
  phone?: string | null
  cpfCnpj?: string | null
  isEmailConfirmed?: boolean
  defaultOrganizationId?: string | null
  planType?: "FREE" | "PREMIUM" | "PRO"
  profilePhoto?: string | null
  preferences?: unknown
  lastLogin?: Date | null
}

export class UserRepository extends BaseRepository {
  constructor(dbClient = prisma) {
    super(dbClient)
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
    }) as Promise<UserRecord | null>
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({
      where: { email },
    }) as Promise<UserRecord | null>
  }

  async findMany(params?: { page?: number; pageSize?: number }): Promise<{ users: UserRecord[]; total: number }> {
    const { skip, take } = this.getPagination(params)

    const [users, total] = (await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.user.count(),
    ])) as [UserRecord[], number]

    return { users, total }
  }

  async create(data: CreateUserRecordInput): Promise<UserRecord> {
    return this.prisma.user.create({
      data,
    }) as Promise<UserRecord>
  }

  async update(id: string, data: UpdateUserRecordInput): Promise<UserRecord> {
    return this.prisma.user.update({
      where: { id },
      data,
    }) as Promise<UserRecord>
  }

  async markEmailConfirmed(id: string): Promise<UserRecord> {
    return this.prisma.user.update({
      where: { id },
      data: {
        isEmailConfirmed: true,
      },
    }) as Promise<UserRecord>
  }

  async delete(id: string): Promise<UserRecord> {
    return this.prisma.user.delete({
      where: { id },
    }) as Promise<UserRecord>
  }
}
