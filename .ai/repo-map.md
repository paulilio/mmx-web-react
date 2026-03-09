# Repository Map

## Top-Level Folders
- `app/`: Next.js App Router pages, route layouts, loading boundaries.
- `components/`: feature UI + shared UI primitives.
- `hooks/`: domain hooks (`use-auth`, `use-transactions`, etc).
- `lib/`: client adapter, server layers, domain logic, shared utilities.
- `types/`: shared auth-related types.
- `data/`: mock seed JSON files.
- `config/`: app-level config JSON.
- `docs/`: architecture, API contracts, deployment, frontend conventions.
- `scripts/`: local validation/migration utility scripts.
- `.dev-workspace/tsk/`: local task/workspace artifacts (developer-local, not product runtime).

## Important Files
- `lib/client/api.ts`: canonical data adapter boundary.
- `lib/client/api.ts` (API mode): unwraps `{ data, error }`, supports temporary legacy non-envelope payloads, and throws explicit `ApiError` for envelope/network errors (no auto mock fallback).
- `hooks/use-auth.tsx`: auth context; in `USE_API=true` login uses `POST /api/auth/login` (logout/refresh migration still in progress).
- `hooks/use-auth.test.tsx`: unit coverage for API-mode login success and friendly error mapping.
- `hooks/use-session.ts`: session validity and extension behavior.
- `lib/server/storage.ts`: mock storage helpers and cache behavior.
- `lib/server/migration-service.ts`: legacy key migration and user-scoped storage helpers.
- `middleware.ts`: `/api` CORS handling (including preflight), origin enforcement, centralized auth gate for protected APIs, and security headers.
- `app/layout.tsx`: root providers and app shell wiring.
- `.github/copilot-instructions.md`: AI generation constraints.

## API Endpoint Usage (Current)
- Implemented in `lib/client/api.ts` mock adapter when `NEXT_PUBLIC_USE_API=false`:
  - `GET/POST/PUT/DELETE /areas`
  - `GET/POST/PUT/DELETE /category-groups`
  - `GET/POST/PUT/DELETE /categories`
  - `GET/POST/PUT/DELETE /contacts`
  - `GET/POST/PUT/DELETE /transactions`
  - `GET /reports/summary`
  - `GET /reports/aging`
  - `GET /reports/cashflow?days=&status=`
- Resolved to first-party Next.js routes by `resolveApiUrl` in `lib/client/api.ts` when `NEXT_PUBLIC_USE_API=true`:
  - `/transactions`, `/categories`, `/contacts`, `/auth`, `/areas`, `/budget`, `/budget-allocations`

## First-Party API Routes (Active)
- Transactions: `app/api/transactions/**`
- Categories: `app/api/categories/**`
- Contacts: `app/api/contacts/**`
- Budget: `app/api/budget/**`, `app/api/budget-allocations/**`
- Areas: `app/api/areas/**`
- Auth:
  - `app/api/auth/login/route.ts`
  - `app/api/auth/register/route.ts`
  - `app/api/auth/refresh/route.ts`
  - `app/api/auth/logout/route.ts`
  - `app/api/auth/oauth/google/**`
  - `app/api/auth/oauth/microsoft/**`

## Shared Utilities
- `lib/shared/utils.ts`: class merge (`cn`), format helpers, audit wrappers.
- `lib/shared/date-utils.ts`: date parsing/formatting helpers.
- `lib/shared/validations.ts`: Zod schemas and form data types.
- `lib/shared/audit-logger.ts`: audit event persistence and filtering.

## Service Layer
- `lib/server/persistence-service.ts`: transaction persistence abstraction.
- `lib/server/user-data-service.ts`: user-context data operations.
- `lib/server/migration-service.ts`: key migration + user data isolation helper.
- `lib/server/services/auth-service.ts`: auth register/login orchestration and `lastLogin` update.
- `lib/server/security/rate-limit.ts`: auth rate limiting.
- `lib/server/security/cors.ts`: CORS by environment.
- `lib/server/security/auth-cookies.ts`: secure auth cookie helpers.
- `lib/server/security/password-hash.ts`: password hash/verify with `bcryptjs`.
- `lib/server/security/jwt.ts`: access/refresh token sign/verify helpers.
- `lib/server/security/refresh-session-store.ts`: refresh token rotation/revocation store.
- `lib/server/security/auth-identity.ts`: authenticated user identity resolver from bearer/cookie.

## Build and Deployment References
- `package.json`: scripts (`dev`, `build`, `lint`) and dependencies.
- `next.config.mjs`: Next.js build/lint behavior.
- `docs/deployment.md`: Vercel and environment guidance.
- `scripts/validate-env.mjs`: environment and secret validation.
- Environment flags:
  - `NEXT_PUBLIC_USE_API`, `NEXT_PUBLIC_API_BASE`
  - `MMX_APP_ENV`, `CORS_ORIGINS_DEV`, `CORS_ORIGINS_STAGING`, `CORS_ORIGINS_PROD`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
  - `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_REDIRECT_URI`, `MICROSOFT_TENANT_ID`
