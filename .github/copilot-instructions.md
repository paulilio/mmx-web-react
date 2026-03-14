# Copilot Instructions for MMX Web React

## Project Snapshot
- Purpose: personal finance SaaS frontend + dedicated backend workspace.
- Frontend: Next.js 14 App Router, React 19, TypeScript 5.
- Backend: NestJS in apps/api, Modular Monolith + DDD, Prisma + PostgreSQL.
- Runtime: Node.js 22+, pnpm.
- Operational runtime outputs: runtime/<service>/... (front, api, monitor).

## Architecture Rules
- Frontend data boundary is lib/client/api.ts.
- Backend source of truth is apps/api.
- Do not introduce transitional architecture narratives.
- Keep DDD layering in backend contexts:
  - presentation
  - application
  - domain
  - infrastructure
- Domain must not depend on NestJS, Prisma, or transport types.
- Controllers remain thin and delegate to use cases.
- Repository ports live in application and implementations live in infrastructure.

## Coding Rules
- TypeScript strict-first.
- Style: double quotes, no semicolons, 2-space indentation.
- Naming:
  - files: kebab-case
  - components/types: PascalCase
  - variables/functions/hooks: camelCase
  - constants: SCREAMING_SNAKE_CASE
- Prefer user-facing messages in Portuguese.

## Data and API Rules
- UI/components must access data via hooks and lib/client/api.ts only.
- Preserve envelope contract:
  - success: { data, error: null }
  - failure: { data: null, error }
- In NEXT_PUBLIC_USE_API=true:
  - keep explicit adapter errors (ApiError, including connectivity status 0)
  - do not fallback automatically to mock
  - external NEXT_PUBLIC_API_BASE requests must use credentials include

## Security Baseline (Do Not Regress)
- JWT access + refresh tokens.
- Refresh token rotation/revocation.
- Auth cookies with HttpOnly, SameSite, Secure in production.
- Auth rate limiting.
- CORS by environment.
- OAuth providers: Google and Microsoft.

## Testing Rules
- Preferred stack: Vitest + Testing Library.
- Playwright for E2E critical flows.
- Add tests for critical behavior changes.
- For backend tests, prioritize status, envelope and security assertions.

## AI Contribution Workflow
- Before editing read: AGENTS.md and .ai/*.md guidance.
- If architecture/contracts/security/runtime changes, update:
  - README.md
  - docs/**
  - AGENTS.md
  - .github/copilot-instructions.md
  - .ai/**
- Use docs/documentation-governance-checklist.md before finalizing architecture/security changes.

## Validation Checklist Before Finalizing
- pnpm test:unit
- pnpm test:integration
- pnpm lint
- pnpm type-check
- pnpm build
- pnpm validate:env -- --env=development

For release/hardening changes:
- pnpm validate:env -- --env=production
