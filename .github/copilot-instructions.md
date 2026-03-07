# Copilot Instructions for MMX Web React

## Project Snapshot
- Purpose: personal finance frontend (auth, dashboard, transactions, budget, categories, contacts, settings).
- Stack: Next.js 14 App Router, React 19, TypeScript 5, Tailwind CSS v4, SWR, React Hook Form, Zod, Radix/shadcn.
- Runtime: Node.js 22+, pnpm.
- Current data mode: hybrid mock-first + first-party API routes; client adapter boundary is `lib/client/api.ts`.

## Architecture Rules
- Use layered flow: `app` -> `components` -> `hooks` -> `lib/client/api.ts` -> `app/api/**` (or mock adapters).
- Keep route UI in `app/**/page.tsx`; keep reusable UI in `components/**`.
- Keep business logic in hooks and `lib/**`; hooks must not render JSX.
- Respect route protection setup: `middleware.ts`, `components/auth/auth-guard.tsx`, `components/auth/session-monitor.tsx`.
- Do not edit `components/ui/**` unless explicitly requested.
- Keep server cross-cutting concerns centralized in `lib/server/security/**` and wired through `middleware.ts` when applicable.

## Coding Rules
- TypeScript strict-first; avoid `any`.
- Style: double quotes, no semicolons, 2-space indentation.
- Naming:
  - files: `kebab-case`
  - components/types: `PascalCase`
  - vars/functions/hooks: `camelCase` and hooks with `use*`
  - constants: `SCREAMING_SNAKE_CASE`
- Reuse existing utilities (`cn` from `lib/utils.ts`, schemas in `lib/validations.ts`).
- Add `"use client"` only when required.
- Prefer user-facing messages in Portuguese.

## Data and API Rules
- Access data through hooks and `lib/client/api.ts` only.
- Keep mock keys with `mmx_` prefix.
- Keep multi-user isolation via `userId` filtering in reads/writes.
- Keep transaction/form dates in `YYYY-MM-DD`.
- Use typed errors where possible (`ApiError`) and do not expose raw technical errors in UI.
- Backend response envelope target: success `{ data, error: null }`, failure `{ data: null, error }`.
- Domains already migrated to first-party API routes: `transactions`, `categories`, `contacts`, `budget`, `budget-allocations`, `areas`, `auth`.
- OAuth provider status: Google integrated (`/api/auth/oauth/google` + `/api/auth/oauth/google/callback`) e Microsoft integrated (`/api/auth/oauth/microsoft` + `/api/auth/oauth/microsoft/callback`).
- Keep auth hardening behavior intact:
  - rate limiting in `POST /api/auth/login|register|refresh`
  - CORS policy for `/api` managed in `middleware.ts` via `lib/server/security/cors.ts`
- Environment switches:
  - `NEXT_PUBLIC_USE_API`
  - `NEXT_PUBLIC_API_BASE`
  - `MMX_APP_ENV`
  - `CORS_ORIGINS_DEV`
  - `CORS_ORIGINS_STAGING`
  - `CORS_ORIGINS_PROD`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI`
  - `MICROSOFT_CLIENT_ID`
  - `MICROSOFT_CLIENT_SECRET`
  - `MICROSOFT_REDIRECT_URI`
  - `MICROSOFT_TENANT_ID`

## Testing Rules
- Preferred stack for new tests: Vitest + Testing Library; Playwright for E2E.
- Add tests for business-critical behavior (auth flows, transactions, budget flows).
- Naming: `*.test.ts` / `*.test.tsx`.
- Mock `lib/client/api.ts` boundary, not deep implementation details.

## Contribution Rules
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Before merge: run `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build`.
- Update docs (`docs/**`, `README.md`, this file) when architecture/flow/contracts change.

## Avoid
- Do not introduce new test shortcuts in production paths (direct login/mock tokens/codes).
- Do not create parallel patterns when equivalent hooks/services already exist.
- Do not bypass `lib/client/api.ts` by reading/writing storage directly from feature UI.
