# AGENTS

Use this file as the entrypoint for AI coding agents (Copilot, Codex, v0, and similar tools).

## Read Order (Mandatory)
1. `.github/copilot-instructions.md`
2. `.ai/project-context.md`
3. `.ai/architecture.md`
4. `.ai/coding-guidelines.md`
5. `.ai/testing-guidelines.md`
6. `.ai/repo-map.md`

## Operating Rules
- Follow repository conventions exactly (naming, file placement, TypeScript style).
- Respect architecture boundaries:
  - `app` for route pages/layouts
  - `components` for UI
  - `hooks` for domain logic
  - `lib/client/api.ts` as data boundary
- Prefer extending existing hooks/services over introducing parallel patterns.
- Do not edit `components/ui/**` unless explicitly requested.
- Keep user-facing messages in Portuguese when adding or changing UI copy.

## Data and API Constraints
- Use hooks + `lib/client/api.ts` for data access.
- Preserve `userId` isolation in reads/writes.
- Use `mmx_` prefix for mock storage keys.
- Keep transaction/form dates in `YYYY-MM-DD`.
- Keep API response envelope consistent: `{ data, error }`.
- In `NEXT_PUBLIC_USE_API=true`, keep explicit adapter error behavior (including connectivity errors) and do not add automatic mock fallback.
- Current frontend auth migration status: in `NEXT_PUBLIC_USE_API=true`, `use-auth` login/logout use `POST /api/auth/login|logout`, `use-session` refresh uses `POST /api/auth/refresh`, and auth bootstrap no longer depends on local `auth_session`.
- Current domain migration status: first-party routes for `category-groups` and `reports` (`summary`, `aging`, `cashflow`) are implemented in `app/api/**`, and adapter routing in `lib/client/api.ts` is converged to `/api/*` in `NEXT_PUBLIC_USE_API=true`.
- Keep server cross-cutting security centralized in `lib/server/security/**` + `middleware.ts`.

## Security Baseline (Current)
- Auth hardening already active:
  - rate limiting in `POST /api/auth/login|register|refresh`
  - CORS by environment for `/api`
  - secure auth cookies (`HttpOnly`, `SameSite`, `Secure` in production)
  - JWT access/refresh token flow with refresh rotation/revocation in server security layer
  - central middleware authorization gate for protected APIs (`401 AUTH_REQUIRED` without token)
  - security headers in `middleware.ts`
- Auth base already active:
  - `register/login` delegated to `lib/server/services/auth-service.ts`
  - password hashing/verification in `lib/server/security/password-hash.ts` (`bcryptjs`)
  - `lastLogin` updated on successful login
  - `POST /api/auth/logout` for refresh revocation and cookie cleanup
- OAuth providers active:
  - Google: `/api/auth/oauth/google` + `/api/auth/oauth/google/callback`
  - Microsoft: `/api/auth/oauth/microsoft` + `/api/auth/oauth/microsoft/callback`

## Testing Expectations
- For new behavior, add/update tests following `.ai/testing-guidelines.md`.
- Prefer mocking `lib/client/api.ts` boundary rather than deep implementation internals.

## Build and Validation
- Before finalizing changes, run:
  - `pnpm test:unit`
  - `pnpm test:integration`
  - `pnpm lint`
  - `pnpm type-check`
  - `pnpm build`
  - `pnpm validate:env -- --env=development`

For release/hardening changes, also run:
- `pnpm validate:env -- --env=production`
