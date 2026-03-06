# Copilot Instructions for MMX Web React

## Project Snapshot
- Purpose: personal finance frontend (auth, dashboard, transactions, budget, categories, contacts, settings).
- Stack: Next.js 14 App Router, React 19, TypeScript 5, Tailwind CSS v4, SWR, React Hook Form, Zod, Radix/shadcn.
- Runtime: Node.js 22+, pnpm.
- Current data mode: mock-first with `localStorage`; adapter boundary is `lib/api.ts`.

## Architecture Rules
- Use layered flow: `app` -> `components` -> `hooks` -> `lib/api.ts` -> storage/API.
- Keep route UI in `app/**/page.tsx`; keep reusable UI in `components/**`.
- Keep business logic in hooks and `lib/**`; hooks must not render JSX.
- Respect route protection setup: `middleware.ts`, `components/auth/auth-guard.tsx`, `components/auth/session-monitor.tsx`.
- Do not edit `components/ui/**` unless explicitly requested.

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
- Access data through hooks and `lib/api.ts` only.
- Keep mock keys with `mmx_` prefix.
- Keep multi-user isolation via `userId` filtering in reads/writes.
- Keep transaction/form dates in `YYYY-MM-DD`.
- Use typed errors where possible (`ApiError`) and do not expose raw technical errors in UI.
- Backend response envelope target: success `{ data, error: null }`, failure `{ data: null, error }`.
- Environment switches:
  - `NEXT_PUBLIC_USE_API`
  - `NEXT_PUBLIC_API_BASE`

## Testing Rules
- Preferred stack for new tests: Vitest + Testing Library; Playwright for E2E.
- Add tests for business-critical behavior (auth flows, transactions, budget flows).
- Naming: `*.test.ts` / `*.test.tsx`.
- Mock `lib/api.ts` boundary, not deep implementation details.

## Contribution Rules
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Before merge: run `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build`.
- Update docs (`docs/**`, `README.md`, this file) when architecture/flow/contracts change.

## Avoid
- Do not introduce new test shortcuts in production paths (direct login/mock tokens/codes).
- Do not create parallel patterns when equivalent hooks/services already exist.
- Do not bypass `lib/api.ts` by reading/writing storage directly from feature UI.
