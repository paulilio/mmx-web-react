import { Inject, Injectable } from "@nestjs/common"
import {
  OPEN_FINANCE_PROVIDER,
  type OpenFinanceProvider,
} from "../ports/open-finance-provider.port"

export interface CreateWidgetTokenInput {
  userId: string
  cpf?: string
  fullName?: string
}

export interface CreateWidgetTokenOutput {
  accessToken: string
  expiresIn: number
}

@Injectable()
export class CreateWidgetTokenUseCase {
  constructor(
    @Inject(OPEN_FINANCE_PROVIDER)
    private readonly provider: OpenFinanceProvider,
  ) {}

  async execute(input: CreateWidgetTokenInput): Promise<CreateWidgetTokenOutput> {
    if (!input.userId?.trim()) throw new Error("userId obrigatorio")
    const result = await this.provider.createWidgetToken({
      externalUserId: input.userId,
      cpf: input.cpf,
      fullName: input.fullName,
    })
    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    }
  }
}
