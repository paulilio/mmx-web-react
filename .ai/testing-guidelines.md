# Testing Guidelines

## Testing Stack
- Unit and component tests: Vitest + Testing Library.
- E2E tests: Playwright (for critical flows).
- Current repo state: broad unit coverage exists for server/domain/auth routes; keep expanding with new behavior.

## Unit Test Rules
- Target pure logic first:
  - `lib/server/**` services/repositories/security helpers.
  - `lib/domain/**` entities/rules.
  - validation schemas in `lib/shared/validations.ts`.
  - hook business logic with controlled mocks.
- Keep tests deterministic; avoid real time/network dependencies.
- Prefer `pnpm test:unit` + `pnpm test:integration` for CI/local validation, and `pnpm test:unit:watch` while developing tests.

## Integration Test Rules
- Test feature behavior through user interactions:
  - form submission paths.
  - modal open/edit/save/cancel flows.
  - error/loading/empty states.
- Use `pnpm test:integration` for route/integration regression checks (`app/api/**` + `middleware.test.ts`).
- Mock `lib/client/api.ts` boundary, not deep internals.
- For component tests that require browser APIs, use `/** @vitest-environment jsdom */` in the test file.

## API Route Test Rules
- For `app/api/**` tests, prefer mocking repositories/services rather than lower DB internals.
- Use `vi.hoisted` + `vi.mock` for stable mocks in route tests.
- Keep route response assertions focused on:
  - HTTP status code
  - envelope `{ data, error }`
  - security behavior when relevant (`429`, CORS blocks, cookie emission).

## E2E Strategy
- Prioritize journeys with highest business risk:
  - auth login/confirm/reset flow.
  - OAuth callback success/failure flow (Google/Microsoft).
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
\`\`\`text
feature/
  transaction-form-modal.tsx
  transaction-form-modal.test.tsx
hooks/
  use-transactions.ts
  use-transactions.test.ts
lib/
  validations.ts
  validations.test.ts
\`\`\`

## CI Recommendations
- Validate at least: `pnpm test:unit`, `pnpm test:integration`, `pnpm lint`, `pnpm type-check`, `pnpm build`.
- For environment-sensitive changes, run `pnpm validate:env -- --env=development` and (for release checks) `--env=production`.
- Keep `pnpm test:unit` and `pnpm test:integration` in CI for every PR.
