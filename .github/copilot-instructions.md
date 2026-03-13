# Copilot Instructions for MMX Web React

## Project Snapshot
- Purpose: personal finance web app (auth, dashboard, transactions, budget, categories, contacts, settings, admin audit logs).
- Stack: Next.js 14 App Router, React 19, TypeScript 5, Tailwind CSS v4, SWR, React Hook Form, Zod, Radix/shadcn.
- Runtime: Node.js 22+, pnpm.
- Current mode: hybrid mock-first + first-party API routes, with client boundary in `lib/client/api.ts`.
- Target architecture: Option B with separated services (`mmx-web-react` frontend + `mmx-api` backend). Current `app/api/**` routes are transitional during migration.
- First-party domains currently active: `transactions`, `categories`, `category-groups`, `contacts`, `budget`, `budget-allocations`, `areas`, `settings`, `auth`, `reports/summary`, `reports/aging`, `reports/cashflow`.

## Architecture Rules
- Keep this layered flow:
  - client: `app/**` -> `components/**` -> `hooks/**` -> `lib/client/api.ts`
  - server: `app/api/**` -> `lib/server/services/**` -> `lib/domain/**` -> `lib/server/repositories/**` -> Prisma
- In `app/api/**`, consume service instances from `lib/server/services` (composition root in `lib/server/services/index.ts`).
- Do not instantiate services in route files and do not import repositories/prisma directly in route handlers.
- Keep route UI in `app/**/page.tsx`; keep reusable UI in `components/**`.
- Keep business rules in hooks/services/domain; hooks must not render JSX.
- Respect route/session protection setup: `middleware.ts`, `components/auth/auth-guard.tsx`, `components/auth/session-monitor.tsx`.
- Keep cross-cutting server concerns centralized in `lib/server/security/**` and wired in `middleware.ts` when applicable.
- Do not edit `components/ui/**` unless explicitly requested.

## Coding Rules
- TypeScript strict-first; avoid `any` unless no safe alternative exists.
- Style: double quotes, no semicolons, 2-space indentation.
- Naming:
  - files: `kebab-case`
  - components/types: `PascalCase`
  - vars/functions/hooks: `camelCase` (hooks start with `use`)
  - constants: `SCREAMING_SNAKE_CASE`
- Reuse existing helpers/schemas (`cn` from `lib/shared/utils.ts`, schemas in `lib/shared/validations.ts`).
- Add `"use client"` only when required.
- Prefer user-facing messages in Portuguese.

## Data and API Rules
- UI/components must access data via hooks and `lib/client/api.ts` only.
- During migration to `mmx-api`, keep `lib/client/api.ts` as the single adapter boundary and avoid creating parallel frontend API client layers.
- Do not bypass adapter boundaries by reading/writing storage directly in feature UI.
- Keep mock storage keys prefixed with `mmx_`.
- Preserve multi-user isolation with `userId` filtering in reads/writes.
- Keep transaction/form dates in `YYYY-MM-DD`.
- Keep API envelope contract stable:
  - success: `{ data, error: null }`
  - failure: `{ data: null, error }`
- In `NEXT_PUBLIC_USE_API=true`, preserve explicit adapter errors (`ApiError`, including connectivity `status: 0`) and no automatic fallback to mock.
- In `NEXT_PUBLIC_USE_API=true`, external requests routed to `NEXT_PUBLIC_API_BASE` must use `credentials: "include"` for cookie-based auth, while first-party `/api/*` routing behavior remains unchanged.
- Current frontend auth migration status: in `NEXT_PUBLIC_USE_API=true`, `use-auth` login/logout use `POST /api/auth/login|logout`, `use-session` refresh uses `POST /api/auth/refresh`, and auth bootstrap no longer depends on local `auth_session`.
- Current budget hook convergence status (E3): `use-budget-allocations` is the primary path for active product flows; `use-budget.ts` remains only as legacy compatibility during transition.
- Current settings maintenance status: `import/export/clear` now run via first-party routes (`/api/settings/*`) and `hooks/use-settings-maintenance.ts`; `app/settings/page.tsx` must not access storage/localStorage directly for these flows.
- Current OAuth callback orchestration status: Google/Microsoft callbacks delegate user create/update/login flow to `lib/server/services/oauth-auth-service.ts`.
- Use typed errors where possible (for example `ApiError`) and avoid exposing raw technical errors in UI.

## Security Baseline (Do Not Regress)
- Auth rate limiting is active in `POST /api/auth/login|register|refresh` via `lib/server/security/rate-limit.ts`.
- CORS for `/api` is centralized in `lib/server/security/cors.ts` + `middleware.ts`, including preflight handling.
- Auth cookies are centralized in `lib/server/security/auth-cookies.ts` with secure behavior (`HttpOnly`, `SameSite`, `Secure` in production).
- Auth base uses `lib/server/services/auth-service.ts` for `register/login`, with password hashing in `lib/server/security/password-hash.ts` (`bcryptjs`) and `lastLogin` update on successful login.
- JWT is active via `lib/server/security/jwt.ts` with access+refresh tokens and refresh rotation/revocation via `lib/server/security/refresh-session-store.ts`.
- `POST /api/auth/logout` is active for refresh revocation and auth cookie cleanup.
- Protected API authorization gate is centralized in `middleware.ts` (returns `401 AUTH_REQUIRED` when token is missing).
- Global security headers are applied in `middleware.ts` (including HSTS in production).
- OAuth providers integrated and must preserve current `start + callback` flow with state validation:
  - Google: `/api/auth/oauth/google` + `/api/auth/oauth/google/callback`
  - Microsoft: `/api/auth/oauth/microsoft` + `/api/auth/oauth/microsoft/callback`

## Environment Variables
- Runtime/API mode: `NEXT_PUBLIC_USE_API`, `NEXT_PUBLIC_API_BASE`, `MMX_APP_ENV`.
- CORS: `CORS_ORIGINS_DEV`, `CORS_ORIGINS_STAGING`, `CORS_ORIGINS_PROD`.
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
- Microsoft OAuth: `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_REDIRECT_URI`, `MICROSOFT_TENANT_ID`.

## Testing Rules
- Preferred stack: Vitest + Testing Library (Playwright for E2E critical flows).
- Add tests for business-critical behavior (auth/OAuth, transactions, budget flows).
- Naming: `*.test.ts` / `*.test.tsx`.
- Mock the `lib/client/api.ts` boundary for client-side tests, not deep internals.
- In `app/api/**` tests, prioritize status/envelope/security assertions (for example `429`, CORS behavior, cookie emission).

## AI Contribution Workflow
- Before editing, read: `AGENTS.md`, then `.ai/project-context.md`, `.ai/architecture.md`, `.ai/coding-guidelines.md`, `.ai/testing-guidelines.md`, `.ai/repo-map.md`, `.ai/documentation-governance.md`.
- Prefer extending existing hooks/services/repositories rather than creating parallel patterns.
- If architecture/contracts/security behavior changes, update docs consistently: `README.md`, `docs/**`, `.ai/**`, `AGENTS.md`, and this file.
- For architecture/contracts/security/runtime changes, execute `docs/documentation-governance-checklist.md` before finalizing and reflect impacted files in the PR summary.

## Validation Checklist Before Finalizing
- Run:
  - `pnpm test:unit`
  - `pnpm test:integration`
  - `pnpm lint`
  - `pnpm type-check` (`tsc --noEmit` equivalent)
  - `pnpm build`
  - `pnpm validate:env -- --env=development`
- For release/hardening changes, also run:
  - `pnpm validate:env -- --env=production`

## Avoid
- Do not introduce production-path shortcuts for auth/tests (direct login/mock tokens/codes).
- Do not duplicate security logic route-by-route if an existing helper exists in `lib/server/security/**`.
- Do not create alternative data access paths that bypass hooks + `lib/client/api.ts`.
- Do not bypass architecture guardrails in `.eslintrc.json` for `app/api/**/route.ts` (`no-restricted-imports` for repositories/prisma).
