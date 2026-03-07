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
- Auth routes currently active: login/register/refresh and OAuth (Google + Microsoft).

## Data and Persistence Boundary
- Adapter entrypoint for UI/hook calls: `lib/client/api.ts`.
- Storage support (mock mode and migration): `lib/server/storage.ts`, `lib/server/persistence-service.ts`, `lib/server/migration-service.ts`, `lib/server/user-data-service.ts`.
- First-party API domains already migrated:
  - transactions
  - categories
  - contacts
  - budget
  - budget-allocations
  - areas
  - auth

## Security Architecture
- CORS policy: `lib/server/security/cors.ts` wired in `middleware.ts` for `/api`.
- Rate limiting: `lib/server/security/rate-limit.ts` on auth endpoints.
- Auth cookies: `lib/server/security/auth-cookies.ts`.
- Global security headers: set in `middleware.ts` (plus HSTS in production).

## Data Flow Rules
- Keep fetch/mutation in hooks or dedicated services, not in page components.
- Keep storage/API branching inside `lib/client/api.ts` and lower server/client boundaries.
- Keep entities user-scoped (`userId`) for read/write operations.
- Keep API response envelope consistent: `{ data, error }`.

## Architecture Constraints for AI
- Extend existing hook/service/repository first; avoid parallel abstractions.
- Do not bypass `lib/client/api.ts` from UI code.
- Do not move business rules from domain/service to page components.
- Prefer reusing `lib/server/security/*` for cross-cutting concerns rather than route-local duplication.
