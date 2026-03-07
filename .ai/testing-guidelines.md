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

## Integration Test Rules
- Test feature behavior through user interactions:
  - form submission paths.
  - modal open/edit/save/cancel flows.
  - error/loading/empty states.
- Mock `lib/client/api.ts` boundary, not deep internals.

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
- Validate at least: `pnpm test:unit`, `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build`.
- For environment-sensitive changes, run `pnpm validate:env -- --env=development` and (for release checks) `--env=production`.
- Add test script execution to CI once test setup is finalized.
