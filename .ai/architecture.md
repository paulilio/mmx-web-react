# Architecture

## High-Level Architecture
- Pattern: layered app + backend slices.
- Client flow: Page/UI -> Feature Component -> Domain Hook -> `lib/client/api.ts`.
- Server flow (first-party routes): `app/api/**` -> `lib/server/services/**` -> `lib/domain/**` -> `lib/server/repositories/**` -> Prisma.

## Module Boundaries
- `app/`: routing, pages, route-level layouts, loading states, API routes.
- `components/`: feature UI and interaction surfaces.
- `hooks/`: domain orchestration and side effects; no JSX.
- `lib/client/`: client adapter boundary.
- `lib/server/`: server services, repositories, DB, HTTP helpers, security.
- `lib/domain/`: domain entities and business rules.
- `types/`: cross-module contracts, especially auth-related types.

## Auth and Session Boundary
- Client context owner: `hooks/use-auth.tsx`.
- Session behavior: `hooks/use-session.ts`.
- Route protection: `middleware.ts` + `components/auth/auth-guard.tsx` + `components/auth/session-monitor.tsx`.
- Auth routes currently active: login/register/refresh/logout and OAuth (Google + Microsoft).
- Auth backend ownership: `lib/server/services/auth-service.ts` + `lib/domain/auth/auth-rules.ts`.

## Data and Persistence Boundary
- Adapter entrypoint for UI/hook calls: `lib/client/api.ts`.
- Server composition root for route dependencies: `lib/server/services/index.ts`.
- Storage support (mock mode and migration): `lib/server/storage.ts`, `lib/server/persistence-service.ts`, `lib/server/migration-service.ts`, `lib/server/user-data-service.ts`.
- First-party API domains already migrated:
  - transactions
  - categories
  - category-groups
  - contacts
  - budget
  - budget-allocations
  - areas
  - settings
  - auth
  - reports/summary
  - reports/aging
  - reports/cashflow

## Security Architecture
- CORS policy: `lib/server/security/cors.ts` wired in `middleware.ts` for `/api`.
- Rate limiting: `lib/server/security/rate-limit.ts` on auth endpoints.
- Auth cookies: `lib/server/security/auth-cookies.ts`.
- Password hashing: `lib/server/security/password-hash.ts` (`bcryptjs`).
- JWT handling: `lib/server/security/jwt.ts` + `lib/server/security/refresh-session-store.ts`.
- Auth identity extraction: `lib/server/security/auth-identity.ts` (Bearer token and auth cookies).
- Authorization gate: centralized in `middleware.ts` for protected API prefixes (returns `401 AUTH_REQUIRED` without token).
- Global security headers: set in `middleware.ts` (plus HSTS in production).

## Data Flow Rules
- Keep fetch/mutation in hooks or dedicated services, not in page components.
- For budget feature flows, prefer `hooks/use-budget-allocations.ts` as the primary hook; keep `hooks/use-budget.ts` only for legacy compatibility.
- For settings maintenance flows (`import/export/clear`), use `hooks/use-settings-maintenance.ts` with `lib/client/api.ts` and `/api/settings/*`.
- Keep storage/API branching inside `lib/client/api.ts` and lower server/client boundaries.
- In `NEXT_PUBLIC_USE_API=true`, handle API payloads via envelope `{ data, error }` first, with temporary legacy non-envelope compatibility only inside the adapter.
- Do not reintroduce automatic mock fallback for API connectivity errors in API mode.
- Keep entities user-scoped (`userId`) for read/write operations.
- Keep API response envelope consistent: `{ data, error }`.

## Architecture Constraints for AI
- Extend existing hook/service/repository first; avoid parallel abstractions.
- Do not bypass `lib/client/api.ts` from UI code.
- Do not move business rules from domain/service to page components.
- Prefer reusing `lib/server/security/*` for cross-cutting concerns rather than route-local duplication.
- In `app/api/**`, import service instances from `lib/server/services` and avoid direct imports from `lib/server/repositories/**` or `lib/server/db/prisma`.
- Do not instantiate services inside route files; use composition from `lib/server/services/index.ts`.
- Keep `.eslintrc.json` architecture guardrails (`no-restricted-imports` for `app/api/**/route.ts`) intact.
