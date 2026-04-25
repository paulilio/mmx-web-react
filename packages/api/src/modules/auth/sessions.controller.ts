import { Controller, Get, Delete, Param, Req, HttpCode, HttpStatus } from "@nestjs/common"
import type { Request } from "express"
import { ListSessionsUseCase } from "./application/use-cases/list-sessions.use-case"
import { RevokeSessionUseCase } from "./application/use-cases/revoke-session.use-case"
import { RevokeAllExceptUseCase } from "./application/use-cases/revoke-all-except.use-case"

@Controller("auth/sessions")
export class SessionsController {
  constructor(
    private readonly listSessions: ListSessionsUseCase,
    private readonly revokeSession: RevokeSessionUseCase,
    private readonly revokeAllExcept: RevokeAllExceptUseCase,
  ) {}

  @Get()
  async list(@Req() req: Request & { userId?: string }) {
    if (!req.userId) {
      throw Object.assign(new Error("Unauthorized"), { status: 401 })
    }

    return await this.listSessions.execute(req.userId)
  }

  @Delete(":sessionId")
  @HttpCode(HttpStatus.OK)
  async revoke(@Param("sessionId") sessionId: string, @Req() req: Request & { userId?: string }) {
    if (!req.userId) {
      throw Object.assign(new Error("Unauthorized"), { status: 401 })
    }

    return await this.revokeSession.execute(req.userId, sessionId)
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async revokeAllOthers(@Req() req: Request & { userId?: string; sessionId?: string }) {
    if (!req.userId) {
      throw Object.assign(new Error("Unauthorized"), { status: 401 })
    }

    const currentSessionId = req.sessionId || "unknown"

    return await this.revokeAllExcept.execute(req.userId, currentSessionId)
  }
}
