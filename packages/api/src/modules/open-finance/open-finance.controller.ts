import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { AuthUser } from "../../common/decorators/auth-user.decorator"
import { OpenFinanceService } from "./application/open-finance.service"
import { CreateWidgetTokenUseCase } from "./application/use-cases/create-widget-token.use-case"
import { RegisterConnectionUseCase } from "./application/use-cases/register-connection.use-case"
import { RevokeConnectionUseCase } from "./application/use-cases/revoke-connection.use-case"
import { ReconcileTransactionUseCase } from "./application/use-cases/reconcile-transaction.use-case"
import {
  parseImportedStatus,
  parsePagination,
  parseReconcileBody,
  parseRegisterConnectionBody,
} from "./open-finance.dto"
import {
  mapConnection,
  mapImportedTransaction,
} from "@/core/lib/server/http/open-finance-mapper"

@Controller("open-finance")
@UseGuards(JwtAuthGuard)
export class OpenFinanceController {
  constructor(
    private readonly service: OpenFinanceService,
    private readonly createWidgetToken: CreateWidgetTokenUseCase,
    private readonly registerConnection: RegisterConnectionUseCase,
    private readonly revokeConnection: RevokeConnectionUseCase,
    private readonly reconcileTransaction: ReconcileTransactionUseCase,
  ) {}

  @Post("widget-token")
  async postWidgetToken(@AuthUser() userId: string) {
    const out = await this.createWidgetToken.execute({ userId })
    return { data: out, error: null }
  }

  @Post("connections")
  @HttpCode(HttpStatus.CREATED)
  async postConnection(@AuthUser() userId: string, @Body() body: unknown) {
    const parsed = parseRegisterConnectionBody(body)
    const out = await this.registerConnection.execute({ userId, ...parsed })
    return {
      data: {
        id: out.id,
        status: out.status.toLowerCase(),
        institutionName: out.institutionName,
        jobId: out.jobId,
        createdAt: out.createdAt.toISOString(),
      },
      error: null,
    }
  }

  @Get("connections")
  async listConnections(@AuthUser() userId: string) {
    const views = await this.service.listForUser(userId)
    return { data: views.map(mapConnection), error: null }
  }

  @Post("connections/:id/sync")
  @HttpCode(HttpStatus.ACCEPTED)
  async syncConnection(@AuthUser() userId: string, @Param("id") id: string) {
    const out = await this.service.enqueueSync(userId, id)
    return { data: { jobId: out.jobId, status: "pending" }, error: null }
  }

  @Delete("connections/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConnection(@AuthUser() userId: string, @Param("id") id: string) {
    await this.revokeConnection.execute({ userId, connectionId: id })
  }

  @Get("connections/:id/imported-transactions")
  async listImported(
    @AuthUser() userId: string,
    @Param("id") id: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const { page: p, pageSize: ps } = parsePagination(page, pageSize)
    const filter = parseImportedStatus(status)
    const result = await this.service.listImportedTransactions(userId, id, {
      status: filter,
      page: p,
      pageSize: ps,
    })
    return {
      data: {
        items: result.items.map(mapImportedTransaction),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
      error: null,
    }
  }

  @Patch("imported-transactions/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async patchImported(
    @AuthUser() userId: string,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const parsed = parseReconcileBody(body)
    await this.reconcileTransaction.execute({
      userId,
      importedTransactionId: id,
      action: parsed.action,
    })
  }
}
