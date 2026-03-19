# CODEBASE MAP — Onde achar o codigo

## Top-Level Folders

| Folder | Purpose |
|---|---|
| packages/web/ | Next.js frontend (mmx-web) |
| packages/web/app/ | Next.js App Router pages and layouts |
| packages/web/app/api/ | Local frontend route handlers (technical scope only) |
| packages/web/components/ | Feature UI and shared UI primitives |
| packages/web/hooks/ | Frontend domain hooks |
| packages/web/hooks/compat/ | Compatibility aliases during hook naming transitions |
| packages/web/lib/ | Frontend adapter, shared utils, server-side support |
| packages/web/lib/client/ | API adapter (api.ts — frontend data boundary) |
| packages/web/lib/shared/ | Shared config, constants, auth-validations, types |
| packages/web/lib/mock/data/ | Mock datasets co-located with mock storage |
| packages/api/ | Dedicated NestJS backend (mmx-api) |
| packages/api/prisma/ | Prisma schema and migrations |
| packages/api/src/common/ | Cross-cutting: decorators, filters, guards, interceptors, logging, middleware |
| packages/api/src/core/ | Core abstractions, security libs, HTTP mappers |
| packages/api/src/config/ | Backend configuration |
| docs/ | Architecture, contracts, deployment, ADRs |
| scripts/ | Validation and operational helper scripts |
| tools/docker/ | Docker compose/runtime scripts |
| runtime/ | Centralized runtime outputs by service |

---

## Module: Auth
Purpose: Authentication, session management, OAuth
Core files:
  - packages/api/src/modules/auth/
Entry points:
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/refresh
  - POST /api/auth/logout
  - GET /api/auth/google, /api/auth/google/callback
  - GET /api/auth/microsoft, /api/auth/microsoft/callback
Dependencies: Settings
Tests: packages/api/src/modules/auth/**/*.test.ts

## Module: Transactions
Purpose: Financial transaction CRUD
Core files:
  - packages/api/src/modules/transactions/
Dependencies: Categories, Category Groups, Contacts, Areas
Tests: packages/api/src/modules/transactions/**/*.test.ts

## Module: Categories
Purpose: Transaction categorization
Core files:
  - packages/api/src/modules/categories/
Dependencies: Transactions, Category Groups

## Module: Category Groups
Purpose: Grouping of categories
Core files:
  - packages/api/src/modules/category-groups/
Dependencies: Categories

## Module: Contacts
Purpose: Clients and suppliers management
Core files:
  - packages/api/src/modules/contacts/
Dependencies: Transactions

## Module: Budget
Purpose: Budget management and allocation
Core files:
  - packages/api/src/modules/budget/
  - packages/api/src/modules/budget-allocations/
Dependencies: Categories, Transactions

## Module: Areas (Centros de Custo)
Purpose: Cost center segmentation
Core files:
  - packages/api/src/modules/areas/
Dependencies: Transactions

## Module: Reports
Purpose: Financial reports (summary, aging, cashflow)
Core files:
  - packages/api/src/modules/reports/
Dependencies: Transactions, Categories, Budget

## Module: Settings
Purpose: User and application settings
Core files:
  - packages/api/src/modules/settings/

## Module: Health
Purpose: Health check endpoint
Core files:
  - packages/api/src/modules/health/

---

## Module: Core Infrastructure
Purpose: Cross-cutting concerns, security, HTTP mappers
Core files:
  - packages/api/src/core/lib/server/security/ (jwt, cors, password-hash, rate-limit, refresh-session-store)
  - packages/api/src/core/lib/server/http/ (*-mapper.ts — areas, budgets, categories, transactions)
  - packages/api/src/common/guards/
  - packages/api/src/common/filters/
  - packages/api/src/common/middleware/
  - packages/api/src/common/interceptors/
Dependencies: All backend modules
Tests: packages/api/src/common/**/*.test.ts

---

## Critical Paths

User login flow:
  packages/web/app/login → packages/web/hooks/use-auth → packages/web/lib/client/api.ts
  → packages/api/src/modules/auth/controller → use-case → domain
  → infrastructure/prisma

Transaction creation flow:
  packages/web/app/transactions → packages/web/hooks/use-transactions → packages/web/lib/client/api.ts
  → packages/api/src/modules/transactions/controller → use-case → domain
  → infrastructure/prisma

Report generation flow:
  packages/web/app/reports → packages/web/hooks → packages/web/lib/client/api.ts
  → packages/api/src/modules/reports/ → transactions + categories + budget

Budget allocation flow:
  packages/web/app/budget → packages/web/hooks/use-budget → packages/web/lib/client/api.ts
  → packages/api/src/modules/budget/controller → use-case → domain
  → budget-allocations → infrastructure/prisma

---

## Important Boundaries
- Frontend data adapter: packages/web/lib/client/api.ts
- Frontend hooks: packages/web/hooks/ (use-auth, use-budget, use-transactions, etc.)
- Backend persistence: packages/api/prisma/ (schema, migrations)
- Backend infrastructure: packages/api/src/infrastructure/database/prisma/ (PrismaModule + PrismaService)
- Data model source of truth: packages/api/prisma/schema.prisma
- Build/validation: package.json scripts (lint, test, type-check, build)
- Environment validation: scripts/validate-env.mjs
