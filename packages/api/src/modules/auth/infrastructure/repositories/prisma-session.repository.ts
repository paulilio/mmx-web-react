import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import {
  ISessionRepository,
  Session,
  CreateSessionInput,
} from "../../application/ports/session-repository.port"

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUserId(userId: string): Promise<Session[]> {
    return this.prisma.refreshSession.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { lastActivityAt: "desc" },
    })
  }

  async findOneById(sessionId: string): Promise<Session | null> {
    return this.prisma.refreshSession.findUnique({
      where: { id: sessionId },
    })
  }

  async revokeById(sessionId: string): Promise<void> {
    await this.prisma.refreshSession.delete({
      where: { id: sessionId },
    })
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshSession.deleteMany({
      where: { userId },
    })
  }

  async revokeAllExcept(userId: string, keepSessionId: string): Promise<void> {
    await this.prisma.refreshSession.deleteMany({
      where: {
        userId,
        id: { not: keepSessionId },
      },
    })
  }

  async create(data: CreateSessionInput): Promise<Session> {
    return this.prisma.refreshSession.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        deviceFingerprint: data.deviceFingerprint,
        userAgent: data.userAgent,
        lastIp: data.lastIp,
        lastActivityAt: new Date(),
      },
    })
  }
}
