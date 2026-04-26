import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
} from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { Prisma } from "@prisma/client"
import { verifyHmacSha256 } from "@/core/lib/server/security/webhook-signature"

const SIGNATURE_HEADER = "x-belvo-signature"

/**
 * Stub controller for Belvo webhooks.
 *
 * NOTE: For correct HMAC verification in production, the Nest app must be
 * configured with rawBody capture (NestFactory.create({ rawBody: true })) and
 * we should validate against the raw bytes — Belvo signs the wire body, not
 * the JSON-canonical form. For PR5 we verify against JSON.stringify(body) as
 * a working stub; production rollout will switch to req.rawBody.
 */
@Controller("open-finance/webhooks")
export class OpenFinanceWebhookController {
  private readonly logger = new Logger(OpenFinanceWebhookController.name)

  constructor(private readonly prisma: PrismaService) {}

  @Post("belvo")
  @HttpCode(HttpStatus.OK)
  async handleBelvo(
    @Headers(SIGNATURE_HEADER) signature: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    const secret = process.env.BELVO_WEBHOOK_SECRET
    if (!secret) {
      this.logger.warn("BELVO_WEBHOOK_SECRET ausente — webhook recusado por segurança")
      throw new UnauthorizedException({
        data: null,
        error: { code: "WEBHOOK_NOT_CONFIGURED", message: "Webhook não configurado" },
      })
    }

    const rawBody = JSON.stringify(body ?? {})
    if (!verifyHmacSha256(rawBody, signature ?? "", secret)) {
      this.logger.warn("Webhook Belvo com assinatura inválida")
      throw new UnauthorizedException({
        data: null,
        error: { code: "INVALID_SIGNATURE", message: "Assinatura inválida" },
      })
    }

    const eventType = typeof body?.event_type === "string" ? body.event_type : null

    await this.prisma.webhookEvent.create({
      data: {
        source: "belvo",
        eventType,
        payload: (body as Prisma.InputJsonValue) ?? {},
        processed: false,
      },
    })

    this.logger.log(`Webhook Belvo recebido (event=${eventType ?? "unknown"})`)
    return { received: true }
  }
}
