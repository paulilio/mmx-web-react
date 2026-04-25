import type { BankConnectionEntity, BankConnectionProps } from "../../domain/bank-connection-entity"

export interface BankConnectionRepositoryPort {
  create(entity: BankConnectionEntity): Promise<BankConnectionProps>
  findById(id: string): Promise<BankConnectionProps | null>
  findByIdAndUser(id: string, userId: string): Promise<BankConnectionProps | null>
  findByProviderLinkId(provider: string, providerLinkId: string): Promise<BankConnectionProps | null>
  listByUser(userId: string): Promise<BankConnectionProps[]>
  update(id: string, patch: Partial<BankConnectionProps>): Promise<BankConnectionProps>
}

export const BANK_CONNECTION_REPOSITORY = Symbol("BANK_CONNECTION_REPOSITORY")
