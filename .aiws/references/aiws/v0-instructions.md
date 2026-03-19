# MMX — v0 Project Instructions

Cole o conteudo abaixo em: **v0 Project → Knowledge → Instructions**

---

## System

This is MMX, a personal finance platform.
Frontend: Next.js 14 App Router + React 19 + TypeScript 5 + Tailwind v4.
Backend: NestJS (apps/api) with DDD modular monolith. PostgreSQL via Prisma.
All data flows through: UI → hooks → lib/client/api.ts → apps/api → PostgreSQL.

## Frontend Rules

- Components in components/ — one component per file, kebab-case filename, PascalCase component name
- Business logic lives in hooks/ — never inside components
- All API calls go through lib/client/api.ts — never fetch directly in components or hooks
- Use TypeScript strict mode — no implicit any
- Style with Tailwind v4 — no inline styles, no CSS modules unless necessary
- Forms: React Hook Form + Zod validation
- Data fetching: SWR

## Component Rules

- Keep components render-only — no business logic
- Props must be typed with TypeScript interfaces
- Avoid prop drilling — use hooks for shared state
- Do not modify components/ui/ (shadcn primitives) unless explicitly asked

## Code Style

- Double quotes, no semicolons, 2-space indentation
- kebab-case for files, PascalCase for components/types, camelCase for functions/variables
- Hooks must start with "use" and must not render JSX

## Architecture Boundaries (do not cross)

- Frontend talks to backend ONLY via lib/client/api.ts
- Do not add business logic to app/api/ routes — that is for technical frontend handlers only
- Do not import from apps/api/ in the frontend
- Envelope contract: all API responses follow { data, error } shape

## Main Frontend Modules

- app/ — pages and layouts (App Router)
- components/ — UI components by feature
- hooks/ — domain hooks (use-auth, use-transactions, use-budget, etc.)
- lib/client/api.ts — API adapter (data boundary)
- lib/shared/ — shared config, constants, types

## Key Features

Transactions, Categories, Category Groups, Contacts, Budget, Areas (cost centers), Reports (summary, aging, cashflow), Auth (JWT + OAuth Google/Microsoft)
