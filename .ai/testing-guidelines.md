# Testing Guidelines

## Testing Stack
- Unit and component tests: Vitest + Testing Library.
- E2E tests: Playwright for critical journeys.

## Unit Test Rules
- Prioritize pure logic:
  - backend application/domain rules in apps/api/src/modules/**
  - security helpers and shared utilities
  - frontend hooks with controlled mocks
- Keep tests deterministic and isolated.

## Integration Test Rules
- Validate feature flows end-to-end at service boundary.
- For frontend integration, mock lib/client/api.ts boundary.
- For backend integration, assert:
  - HTTP status
  - envelope { data, error }
  - security behavior (429, CORS, cookie emission)

## Backend API Test Rules
- Prefer testing controllers/use-cases with repository ports mocked.
- Avoid deep DB internals in controller-level tests.
- Add dedicated repository tests for Prisma behavior.

## E2E Strategy
- Prioritize:
  - auth (login/refresh/logout/OAuth)
  - transaction CRUD
  - budget transfer/rollover
  - reports endpoints

## Naming and Structure
- Use *.test.ts / *.test.tsx.
- Prefer co-location when practical.
- Use behavior-style naming: should ... when ...

## CI Recommendations
- Run at least:
  - pnpm test:unit
  - pnpm test:integration
  - pnpm lint
  - pnpm type-check
  - pnpm build
- For env-sensitive changes:
  - pnpm validate:env -- --env=development
  - pnpm validate:env -- --env=production (release/hardening)
