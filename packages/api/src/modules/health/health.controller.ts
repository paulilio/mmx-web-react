import { Controller, Get, ServiceUnavailableException } from "@nestjs/common"
import { PrismaService } from "../../infrastructure/database/prisma/prisma.service"

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  liveness() {
    return { status: "ok", timestamp: new Date().toISOString() }
  }

  @Get("ready")
  async readiness() {
    const dbHealthy = await this.prisma.isHealthy()
    if (!dbHealthy) {
      throw new ServiceUnavailableException({
        data: null,
        error: { code: "DB_UNAVAILABLE", message: "Banco de dados indisponível" },
      })
    }
    return { status: "ok", db: "connected", timestamp: new Date().toISOString() }
  }
}
