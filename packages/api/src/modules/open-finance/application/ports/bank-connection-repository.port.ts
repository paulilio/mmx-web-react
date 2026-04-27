import type { BankConnectionEntity, BankConnectionProps } from "../../domain/bank-connection-entity"

export interface BankConnectionRepositoryPort {
  create(entity: BankConnectionEntity): Promise<BankConnectionProps>
  findById(id: string): Promise<BankConnectionProps | null>
  findByIdAndUser(id: string, userId: string): Promise<BankConnectionProps | null>
  findByProviderLinkId(provider: string, providerLinkId: string): Promise<BankConnectionProps | null>
  /**
   * Lookup por providerLinkId em texto plano. providerLinkId no DB está encriptado
   * (AES-GCM com IV aleatório), então o resultado exige scan + decrypt iterativo
   * para o `provider` informado. Volume baixo é OK; follow-up: hash determinístico
   * (providerLinkIdHash) + índice unique pra lookup O(1).
   */
  findByPlainProviderLinkId(provider: string, plainProviderLinkId: string): Promise<BankConnectionProps | null>
  listByUser(userId: string): Promise<BankConnectionProps[]>
  update(id: string, patch: Partial<BankConnectionProps>): Promise<BankConnectionProps>
}

export const BANK_CONNECTION_REPOSITORY = Symbol("BANK_CONNECTION_REPOSITORY")
