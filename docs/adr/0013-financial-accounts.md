# ADR-0013 - Financial Accounts as First-Class Entities

Status
Accepted

Context
MMX is currently transaction-centric: users register income/expense linked to categories, areas (cost centers), and contacts, but there is no notion of a "financial account" (checking, savings, credit card, investment, business). The product owner is also the primary user and needs to control multiple real accounts with per-account balances and transfers between them, comparable to QuickBooks or Xero.

Without this layer, the system cannot:
- present a balance per account ("my BB checking account balance"),
- represent credit card invoice payment as a transfer between two accounts,
- persist the multiple accounts that the Open Finance provider (Belvo) already returns and currently discards,
- provide per-account-type screens (checking, credit cards, investments, business).

Decision
Introduce `Account` as a first-class domain entity in the backend, with a CRUD module under `packages/api/src/modules/accounts/`, full DDD layering, and consume it from the frontend with a dedicated `/accounts` page.

Sealed architectural choices
1. **Transfer modeling (future Phase 3, recorded here to avoid refactor)**: double-row paired entries. Each transfer creates two `Transaction` rows linked by `transferGroupId` (one DEBIT on the origin account, one CREDIT on the destination), keeping the invariant "1 Transaction = 1 movement on a single account" and making per-account balance a simple `SUM(amount)`.
2. **Credit card**: `Account.type = CREDIT_CARD` with `closingDay`, `dueDay`, `creditLimit`. Balance represents accumulated debt. Invoice payment is a transfer from a checking account into the credit card. A dedicated `Invoice` entity is deferred to a later phase.
3. **Account balance**: hybrid model. Persist `openingBalance` and `openingBalanceDate` on `Account`; current balance is derived as `openingBalance + SUM(Transaction.amount WHERE accountId = account.id AND date >= openingBalanceDate)`. Materialized cache is a future optimization decided on measurement.
4. **Open Finance binding (future phase)**: when sync detects accounts under a `BankConnection`, MMX persists them as `Account` records with `status = PENDING_REVIEW`, requiring user confirmation before any imported transaction is auto-attached. This protects user expectations and complies with LGPD by avoiding silent provisioning of financial entities.
5. **Existing transactions migration (future Phase 3)**: backfill via a synthetic `Caixa Geral` account per user, with `Transaction.accountId` becoming NOT NULL after backfill. A reclassification UX prompts the owner to re-tag transactions to real accounts.
6. **Business / CNPJ accounts**: `Account.type = BUSINESS` plus `isBusiness` flag. Pro-labore movements are encoded as transfers with an optional `transferKind` discriminator.

Phased rollout
- Phase 1: backend (this ADR scope) - Account model, CRUD, balance endpoint returning opening balance.
- Phase 2: frontend `/accounts` page, sidebar entry, CRUD and overview UI.
- Phase 3: Transaction.accountId, transfers (double-row paired), per-account filter on `/transactions`.
- Phase 4: type-dedicated pages (checking, credit cards, investments, business), dashboard balance widgets, "pay invoice" CTA.
- Phase 5: Open Finance binding to Account, ImportedTransaction.accountId, approval workflow.
- Phase 6: Invoice as derived entity, reports aware of TRANSFER, budget revision.

Consequences
- New first-class boundary: any future financial movement must declare its account context.
- Existing reports (DRE, cashflow) will need to exclude TRANSFER from operating flow once Phase 3 lands.
- Existing `ensureExpenseWithinBalance` rule will be revisited per account type: bypassed for CREDIT_CARD where negative balance is valid up to `creditLimit`.
- Open Finance sync gains a clear destination model rather than discarding `ProviderAccount[]`.
- Migration to NOT NULL `Transaction.accountId` requires a backfill plan executed in Phase 3.

Validation
- Pipeline (`pnpm test:unit && pnpm test:integration && pnpm lint && pnpm type-check && pnpm build && pnpm validate:env -- --env=development`) must pass.
- Smoke test: create accounts of each type via REST, verify type-conditional rules (CREDIT_CARD requires closingDay, dueDay, creditLimit; non-CREDIT_CARD rejects them).
- Frontend smoke after Phase 2: register six real accounts (BB checking, Mercado Pago checking, BB credit card, Nubank credit card, Mercado Pago credit card, BB investment, BB business) under five minutes.

References
- Plan file: `~/.claude/plans/1-onde-est-deployado-velvety-aurora.md` (Fases 1 e 2).
- Related ADRs: ADR-0012 (backend architecture), ADR-0011 (validation strategy), ADR-0009 (managed Postgres).
