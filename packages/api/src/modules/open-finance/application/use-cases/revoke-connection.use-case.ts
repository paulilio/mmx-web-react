import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { decrypt } from "@/core/lib/server/security/encryption"
import { BankConnectionEntity } from "../../domain/bank-connection-entity"
import {
  BANK_CONNECTION_REPOSITORY,
  type BankConnectionRepositoryPort,
} from "../ports/bank-connection-repository.port"
import {
  OPEN_FINANCE_PROVIDER,
  type OpenFinanceProvider,
} from "../ports/open-finance-provider.port"

export interface RevokeConnectionInput {
  userId: string
  connectionId: string
}

@Injectable()
export class RevokeConnectionUseCase {
  constructor(
    @Inject(OPEN_FINANCE_PROVIDER)
    private readonly provider: OpenFinanceProvider,
    @Inject(BANK_CONNECTION_REPOSITORY)
    private readonly connections: BankConnectionRepositoryPort,
  ) {}

  async execute(input: RevokeConnectionInput): Promise<void> {
    const conn = await this.connections.findById(input.connectionId)
    if (!conn) {
      throw new NotFoundException({
        data: null,
        error: { code: "NOT_FOUND", message: "Conexão não encontrada" },
      })
    }
    if (conn.userId !== input.userId) {
      throw new ForbiddenException({
        data: null,
        error: { code: "FORBIDDEN", message: "Sem permissão" },
      })
    }
    if (conn.status === "REVOKED") return

    try {
      const linkId = decrypt(conn.providerLinkId)
      await this.provider.revokeLink(linkId)
    } catch (_err) {
      // Provider revoke pode falhar se link já não existe upstream — não bloqueia revogação local
    }

    if (!conn.id) throw new Error("BankConnection sem id")
    const entity = BankConnectionEntity.fromRecord(conn)
    await this.connections.update(conn.id, entity.markRevoked())
  }
}
