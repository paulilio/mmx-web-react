import { Controller, Delete, Get, NotImplementedException, Param, Post, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { AuthUser } from "../../common/decorators/auth-user.decorator"

@Controller("open-finance")
@UseGuards(JwtAuthGuard)
export class OpenFinanceController {
  @Post("widget-token")
  createWidgetToken(@AuthUser() _userId: string) {
    throw new NotImplementedException({
      data: null,
      error: { code: "NOT_IMPLEMENTED", message: "Endpoint will be implemented in PR2-PR4" },
    })
  }

  @Post("connections")
  registerConnection(@AuthUser() _userId: string) {
    throw new NotImplementedException({
      data: null,
      error: { code: "NOT_IMPLEMENTED", message: "Endpoint will be implemented in PR3-PR4" },
    })
  }

  @Get("connections")
  listConnections(@AuthUser() _userId: string) {
    throw new NotImplementedException({
      data: null,
      error: { code: "NOT_IMPLEMENTED", message: "Endpoint will be implemented in PR3-PR4" },
    })
  }

  @Post("connections/:id/sync")
  syncConnection(@AuthUser() _userId: string, @Param("id") _id: string) {
    throw new NotImplementedException({
      data: null,
      error: { code: "NOT_IMPLEMENTED", message: "Endpoint will be implemented in PR3-PR5" },
    })
  }

  @Delete("connections/:id")
  revokeConnection(@AuthUser() _userId: string, @Param("id") _id: string) {
    throw new NotImplementedException({
      data: null,
      error: { code: "NOT_IMPLEMENTED", message: "Endpoint will be implemented in PR3-PR4" },
    })
  }

  @Get("connections/:id/imported-transactions")
  listImportedTransactions(@AuthUser() _userId: string, @Param("id") _id: string) {
    throw new NotImplementedException({
      data: null,
      error: { code: "NOT_IMPLEMENTED", message: "Endpoint will be implemented in PR3-PR4" },
    })
  }
}
