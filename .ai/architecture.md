# Architecture

## High-Level Architecture
- Pattern: layered frontend architecture.
- Flow: Page/UI -> Feature Component -> Domain Hook -> `lib/api.ts` -> storage/API adapter.
- Data source today: localStorage-backed repositories and migration services.

## Module Boundaries
- `app/`: routing, pages, route-level layouts, loading states.
- `components/`: feature UI and interaction surfaces.
- `hooks/`: domain orchestration and side effects; no JSX.
- `lib/`: adapters, persistence, migration, validation, utilities.
- `types/`: cross-module contracts, especially auth-related types.

## Auth and Session Boundary
- Context owner: `hooks/use-auth.tsx`.
- Session behavior: `hooks/use-session.ts`.
- Route protection: `middleware.ts` + `components/auth/auth-guard.tsx` + `components/auth/session-monitor.tsx`.

## Data and Persistence Boundary
- Adapter entrypoint: `lib/api.ts`.
- Storage support: `lib/storage.ts`, `lib/persistence-service.ts`.
- Migration support: `lib/migration-service.ts`.
- User-scope service: `lib/user-data-service.ts`.

## Folder Responsibilities
- `components/ui/`: design-system primitives (treat as stable shared layer).
- `components/<feature>/`: feature-specific modals/forms/panels.
- `hooks/use-*.ts`: feature API and state contract for pages/components.
- `lib/validations.ts`: Zod schemas used by forms and domain constraints.
- `lib/types.ts`, `types/auth.ts`: canonical type contracts.

## Data Flow Rules
- Keep fetch/mutation inside hooks, not page components.
- Keep storage/API branching inside `lib/api.ts` and lower layers.
- Keep entities user-scoped (`userId`) for read/write operations.
- Use SWR cache keys that are stable and domain-driven.

## Architecture Constraints for AI
- Extend existing hook/service first; avoid parallel patterns.
- Prefer localized feature changes over global cross-cutting edits.
- Do not bypass adapter boundaries from UI code.
