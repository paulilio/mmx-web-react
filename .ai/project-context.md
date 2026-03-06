# Project Context

## System Purpose
- Product: MoedaMix web frontend for personal finance management.
- Main areas: auth, dashboard, transactions, budget, categories, contacts, settings, admin audit logs.
- Current mode: mock-first persistence in browser (`localStorage`) with API adapter boundary in `lib/api.ts`.

## Business Terms
- `Area`: top-level financial grouping.
- `CategoryGroup`: group inside an area.
- `Category`: transaction classification.
- `Transaction`: income/expense record with status and optional recurrence.
- `Budget` / `BudgetAllocation`: planned vs funded vs spent values by period.
- `Contact`: customer or supplier linked to transactions.
- `User` + `Session`: authenticated scope used for data isolation.

## Key Goals
- Keep feature behavior consistent while backend is evolving.
- Preserve multi-user isolation via `userId` in stored entities.
- Allow migration from mock storage to REST API with minimal UI changes.
- Maintain clear domain hooks and typed contracts.

## Core Technologies
- Framework: Next.js 14 App Router.
- UI: React 19, Tailwind CSS v4, shadcn/ui + Radix UI.
- Language: TypeScript 5.
- State/data: SWR for async state, React Context for auth/session.
- Forms/validation: React Hook Form + Zod.
- Charts: Recharts.
- Runtime/tooling: Node.js 22+, pnpm.

## Runtime Modes
- Mock mode (default): `NEXT_PUBLIC_USE_API=false`.
- API mode: `NEXT_PUBLIC_USE_API=true` + `NEXT_PUBLIC_API_BASE`.
- Rule: feature code should not care about mode; use hooks + `lib/api.ts`.

## Current Quality Reality
- Repo docs define Vitest/Testing Library and Playwright strategy.
- Test files are currently sparse/absent; new feature work should include tests.
- Build/lint/type checks exist via scripts (`dev`, `build`, `lint`).
