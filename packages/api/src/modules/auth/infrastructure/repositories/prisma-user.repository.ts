import { Injectable } from "@nestjs/common"
import type { Prisma } from "@prisma/client"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import type { IUserRepository } from "../../application/ports/user-repository.port"
import type { UserRecord, CreateUserInput, UpdateUserInput } from "../../domain/user.types"

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toPrismaCreateData(data: CreateUserInput) {
    return {
      ...data,
      preferences: data.preferences as Prisma.InputJsonValue | undefined,
    }
  }

  private toPrismaUpdateData(data: UpdateUserInput) {
    return {
      ...data,
      preferences: data.preferences as Prisma.InputJsonValue | undefined,
    }
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { id } }) as Promise<UserRecord | null>
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { email } }) as Promise<UserRecord | null>
  }

  async create(data: CreateUserInput): Promise<UserRecord> {
    return this.prisma.user.create({
      data: this.toPrismaCreateData(data),
    }) as Promise<UserRecord>
  }

  async update(id: string, data: UpdateUserInput): Promise<UserRecord> {
    return this.prisma.user.update({
      where: { id },
      data: this.toPrismaUpdateData(data),
    }) as Promise<UserRecord>
  }
}
