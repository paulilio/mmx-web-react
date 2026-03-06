# Testing Guidelines

## Testing Stack
- Unit and component tests: Vitest + Testing Library.
- E2E tests: Playwright (for critical flows).
- Current repo state: automated tests are limited; new work should add tests.

## Unit Test Rules
- Target pure logic first:
  - `lib/` utilities and adapters.
  - validation schemas in `lib/validations.ts`.
  - hook business logic with controlled mocks.
- Keep tests deterministic; avoid real time/network dependencies.

## Integration Test Rules
- Test feature behavior through user interactions:
  - form submission paths.
  - modal open/edit/save/cancel flows.
  - error/loading/empty states.
- Mock `lib/api.ts` boundary, not deep internals.

## E2E Strategy
- Prioritize journeys with highest business risk:
  - auth login/confirm/reset flow.
  - transaction CRUD and recurrence edits/deletes.
  - budget funding/transfer/rollover flows.
- Run E2E on PRs touching auth, transactions, or budget modules.

## Naming and Structure
- Test filenames: `*.test.ts` or `*.test.tsx`.
- Prefer co-location with feature source when practical.
- Use clear behavior-driven names (`should ... when ...`).

## Minimum Coverage Expectations (for new features)
- Happy path behavior.
- Validation failure path.
- API failure path with proper user message.
- State transitions for loading and completion.

## Example Structure
```text
feature/
  transaction-form-modal.tsx
  transaction-form-modal.test.tsx
hooks/
  use-transactions.ts
  use-transactions.test.ts
lib/
  validations.ts
  validations.test.ts
```

## CI Recommendations
- Validate at least: `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build`.
- Add test script execution to CI once test setup is finalized.
