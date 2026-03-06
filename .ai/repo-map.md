# Repository Map

## Top-Level Folders
- `app/`: Next.js App Router pages, route layouts, loading boundaries.
- `components/`: feature UI + shared UI primitives.
- `hooks/`: domain hooks (`use-auth`, `use-transactions`, etc).
- `lib/`: API adapter, storage, migration, validation, utilities.
- `types/`: shared auth-related types.
- `data/`: mock seed JSON files.
- `config/`: app-level config JSON.
- `docs/`: architecture, API contracts, deployment, frontend conventions.
- `scripts/`: local validation/migration utility scripts.

## Important Files
- `lib/api.ts`: canonical data adapter boundary.
- `hooks/use-auth.tsx`: auth context and login/register flows.
- `hooks/use-session.ts`: session validity and extension behavior.
- `lib/storage.ts`: mock storage helpers and cache behavior.
- `lib/migration-service.ts`: legacy key migration and user-scoped storage helpers.
- `middleware.ts`: route matcher + security headers.
- `app/layout.tsx`: root providers and app shell wiring.
- `.github/copilot-instructions.md`: AI generation constraints.

## API Endpoint Usage (Current)
- Implemented in `lib/api.ts` mock adapter:
  - `GET/POST/PUT/DELETE /areas`
  - `GET/POST/PUT/DELETE /category-groups`
  - `GET/POST/PUT/DELETE /categories`
  - `GET/POST/PUT/DELETE /contacts`
  - `GET/POST/PUT/DELETE /transactions`
  - `GET /reports/summary`
  - `GET /reports/aging`
  - `GET /reports/cashflow?days=&status=`
- Used by hooks but not fully implemented in current adapter:
  - `/budget/*`, `/budget-allocations*`, `/budget-groups*`, `/grupos-categorias*`

## Shared Utilities
- `lib/utils.ts`: class merge (`cn`), format helpers, audit wrappers.
- `lib/date-utils.ts`: date parsing/formatting helpers.
- `lib/validations.ts`: Zod schemas and form data types.
- `lib/audit-logger.ts`: audit event persistence and filtering.

## Service Layer
- `lib/persistence-service.ts`: transaction persistence abstraction.
- `lib/user-data-service.ts`: user-context data operations.
- `lib/migration-service.ts`: key migration + user data isolation helper.

## Build and Deployment References
- `package.json`: scripts (`dev`, `build`, `lint`) and dependencies.
- `next.config.mjs`: Next.js build/lint behavior.
- `docs/deployment.md`: Vercel and environment guidance.
- Environment flags: `NEXT_PUBLIC_USE_API`, `NEXT_PUBLIC_API_BASE`.
