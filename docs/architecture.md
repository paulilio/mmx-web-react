# Architecture

## System Overview

MoedaMix is a personal finance dashboard built with Next.js 14 (App Router). Persistence is currently localStorage (JSON mock) with a repository layer designed for API replacement without UI changes.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2 — App Router |
| Language | TypeScript 5 |
| UI | React 19 + shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| State | React Context + SWR |
| Runtime | Node.js 22 |

## Frontend Layers

\`\`\`
UI (pages + components)
        ↓
Custom Hooks  (use-transactions, use-budget, use-auth …)
        ↓
Service Layer (lib/persistence-service, lib/storage, lib/user-data-service)
        ↓
Repository / Adapter  (lib/api.ts  ← swap this for real API calls)
        ↓
localStorage (mock) | REST API (production)
\`\`\`

## Data Flow

1. Page renders → calls domain hook (e.g. `useTransactions`)
2. Hook calls persistence service, which calls `lib/api.ts`
3. `lib/api.ts` reads/writes localStorage; in production, replace with `fetch`
4. Hook returns typed data; component re-renders

## User Isolation

All stored records carry a `userId` field. `UserDataService` filters every read/write by the authenticated user. `MigrationService` upgrades legacy keys on first login.

## Folder Structure

\`\`\`
app/                  # Next.js App Router pages & layouts
components/
  auth/               # AuthGuard, SessionMonitor
  layout/             # Sidebar, MainLayout, Footer
  profile/            # UserProfileButton, modals
  dashboard/          # Charts, SummaryCard
  transactions/       # Forms, recurring modals
  budget/             # Add/Transfer/Rollover modals
  categories/         # Category & group forms
  contacts/           # Contact form
  ui/                 # shadcn/ui primitives
hooks/                # Domain hooks (use-auth, use-transactions …)
lib/                  # Services, utils, types, validations
types/                # Shared TypeScript interfaces
data/                 # JSON seed files (mock mode)
config/               # app-config.json (version, env, feature flags)
scripts/              # Migration validators & test utilities
docs/                 # This folder
\`\`\`

## Integration Points

| Concern | File |
|---|---|
| Auth context | `hooks/use-auth.tsx` |
| Session | `hooks/use-session.ts` |
| Storage adapter | `lib/api.ts` |
| Multi-user migration | `lib/migration-service.ts` |
| Audit log | `lib/audit-logger.ts` |
| Route protection | `middleware.ts` + `components/auth/auth-guard.tsx` |
