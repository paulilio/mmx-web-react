import type { CreateLedgerEventInput, LedgerEventRepository } from "../repositories/ledger-event-repository"

export class LedgerEventService {
  constructor(private readonly repository: LedgerEventRepository) {}

  async record(input: CreateLedgerEventInput) {
    return this.repository.create(input)
  }
}
