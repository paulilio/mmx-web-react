# Project Context

## System Purpose
- Product: MoedaMix web frontend for personal finance management.
- Main areas: auth, dashboard, transactions, budget, categories, contacts, settings, admin audit logs.
- Current mode: hybrid mock-first + first-party backend routes.

## Current Backend Coverage
- Implemented first-party domains: `transactions`, `categories`, `contacts`, `budget`, `budget-allocations`, `areas`, `auth`.
- OAuth providers implemented: Google and Microsoft.
- API hardening implemented: rate limiting on auth endpoints, CORS by environment, security headers, secure auth cookies.

## Business Terms
- `Area`: top-level financial grouping.
- `CategoryGroup`: group inside an area.
- `Category`: transaction classification.
- `Transaction`: income/expense record with status and optional recurrence.
- `Budget` / `BudgetAllocation`: planned vs funded vs spent values by period.
- `Contact`: customer or supplier linked to transactions.
- `User` + `Session`: authenticated scope used for data isolation.

## Key Goals
- Keep feature behavior consistent while backend evolves.
- Preserve multi-user isolation via `userId` in data operations.
- Keep UI isolated from transport mode (mock vs API) via hooks + adapter boundary.
- Maintain typed contracts and envelope responses `{ data, error }`.

## Core Technologies
- Framework: Next.js 14 App Router.
- UI: React 19, Tailwind CSS v4, shadcn/ui + Radix UI.
- Language: TypeScript 5.
- State/data: SWR for async state, React Context for auth/session.
- Forms/validation: React Hook Form + Zod.
- Charts: Recharts.
- Runtime/tooling: Node.js 22+, pnpm.

## Runtime Modes
- Mock mode: `NEXT_PUBLIC_USE_API=false`.
- API mode: `NEXT_PUBLIC_USE_API=true` + `NEXT_PUBLIC_API_BASE`.
- Rule: feature code should not branch by mode directly; use hooks + `lib/client/api.ts`.

## Environment Variables (Important)
- Mode and routing: `NEXT_PUBLIC_USE_API`, `NEXT_PUBLIC_API_BASE`, `MMX_APP_ENV`.
- CORS policy: `CORS_ORIGINS_DEV`, `CORS_ORIGINS_STAGING`, `CORS_ORIGINS_PROD`.
- OAuth Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
- OAuth Microsoft: `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_REDIRECT_URI`, `MICROSOFT_TENANT_ID`.

## AI Contribution Rules (Practical)
- Prefer extending existing hook/service/repository patterns instead of parallel flows.
- Keep auth/security cross-cutting logic under `lib/server/security/**`.
- When updating docs, keep `.ai/*`, `README.md`, and `docs/*` consistent with each other.
- Before finalizing: run `pnpm test:unit`, `pnpm tsc --noEmit`, `pnpm build`, `pnpm lint`, and `pnpm validate:env` as needed.
