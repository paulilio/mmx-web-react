# CODEBASE MAP — Onde achar o codigo

## Top-Level Folders

| Folder | Purpose |
|---|---|
| app/ | Next.js App Router pages and layouts |
| app/api/ | Local frontend route handlers (technical scope only) |
| components/ | Feature UI and shared UI primitives |
| hooks/ | Frontend domain hooks |
| hooks/compat/ | Compatibility aliases during hook naming transitions |
| lib/ | Frontend adapter, shared utils, server-side support |
| lib/client/ | API adapter (api.ts — frontend data boundary) |
| lib/shared/ | Shared config, constants, auth-validations, types |
| lib/mock/data/ | Mock datasets co-located with mock storage |
| apps/api/ | Dedicated NestJS backend (mmx-api) |
| apps/api/prisma/ | Prisma schema and migrations |
| apps/api/src/common/ | Cross-cutting: decorators, filters, guards, interceptors, logging, middleware |
| apps/api/src/core/ | Core abstractions, security libs, HTTP mappers |
| apps/api/src/config/ | Backend configuration |
| docs/ | Architecture, contracts, deployment, ADRs |
| scripts/ | Validation and operational helper scripts |
| docker/scripts/ | Docker compose/runtime scripts |
| runtime/ | Centralized runtime outputs by service |

---

## Module: Auth
Purpose: Authentication, session management, OAuth
Core files:
  - apps/api/src/modules/auth/
Entry points:
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/refresh
  - POST /api/auth/logout
  - GET /api/auth/google, /api/auth/google/callback
  - GET /api/auth/microsoft, /api/auth/microsoft/callback
Dependencies: Settings
Tests: apps/api/src/modules/auth/**/*.test.ts

## Module: Transactions
Purpose: Financial transaction CRUD
Core files:
  - apps/api/src/modules/transactions/
Dependencies: Categories, Category Groups, Contacts, Areas
Tests: apps/api/src/modules/transactions/**/*.test.ts

## Module: Categories
Purpose: Transaction categorization
Core files:
  - apps/api/src/modules/categories/
Dependencies: Transactions, Category Groups

## Module: Category Groups
Purpose: Grouping of categories
Core files:
  - apps/api/src/modules/category-groups/
Dependencies: Categories

## Module: Contacts
Purpose: Clients and suppliers management
Core files:
  - apps/api/src/modules/contacts/
Dependencies: Transactions

## Module: Budget
Purpose: Budget management and allocation
Core files:
  - apps/api/src/modules/budget/
  - apps/api/src/modules/budget-allocations/
Dependencies: Categories, Transactions

## Module: Areas (Centros de Custo)
Purpose: Cost center segmentation
Core files:
  - apps/api/src/modules/areas/
Dependencies: Transactions

## Module: Reports
Purpose: Financial reports (summary, aging, cashflow)
Core files:
  - apps/api/src/modules/reports/
Dependencies: Transactions, Categories, Budget

## Module: Settings
Purpose: User and application settings
Core files:
  - apps/api/src/modules/settings/

## Module: Health
Purpose: Health check endpoint
Core files:
  - apps/api/src/modules/health/

---

## Module: Core Infrastructure
Purpose: Cross-cutting concerns, security, HTTP mappers
Core files:
  - apps/api/src/core/lib/server/security/ (jwt, cors, password-hash, rate-limit, refresh-session-store)
  - apps/api/src/core/lib/server/http/ (*-mapper.ts — areas, budgets, categories, transactions)
  - apps/api/src/common/guards/
  - apps/api/src/common/filters/
  - apps/api/src/common/middleware/
  - apps/api/src/common/interceptors/
Dependencies: All backend modules
Tests: apps/api/src/common/**/*.test.ts

---

## Critical Paths

User login flow:
  app/login → hooks/use-auth → lib/client/api.ts
  → apps/api/modules/auth/controller → use-case → domain
  → infrastructure/prisma

Transaction creation flow:
  app/transactions → hooks/use-transactions → lib/client/api.ts
  → apps/api/modules/transactions/controller → use-case → domain
  → infrastructure/prisma

Report generation flow:
  app/reports → hooks → lib/client/api.ts
  → apps/api/modules/reports/ → transactions + categories + budget

Budget allocation flow:
  app/budget → hooks/use-budget → lib/client/api.ts
  → apps/api/modules/budget/controller → use-case → domain
  → budget-allocations → infrastructure/prisma

---

## Important Boundaries
- Frontend data adapter: lib/client/api.ts
- Frontend hooks: hooks/ (use-auth, use-budget, use-transactions, etc.)
- Backend persistence: apps/api/prisma/ (schema, migrations)
- Backend infrastructure: apps/api/src/infrastructure/database/prisma/ (PrismaModule + PrismaService)
- Data model source of truth: apps/api/prisma/schema.prisma
- Build/validation: package.json scripts (lint, test, type-check, build)
- Environment validation: scripts/validate-env.mjs
