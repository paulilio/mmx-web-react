# CONTEXT SURFACES — O que pode quebrar

Superficies de impacto de mudanca. Consulte antes de alterar codigo para prever efeitos colaterais.

---

## Authentication Surface
Core files:
  - apps/api/src/modules/auth/
  - apps/api/src/core/lib/server/security/ (jwt, cors, password-hash, rate-limit, refresh-session-store)
  - lib/client/api.ts (token handling)
  - hooks/use-auth.tsx
Adjacent surfaces:
  - Settings
  - Security Infrastructure
  - All authenticated endpoints
Risk level: High
Notes: JWT, refresh rotation, OAuth flows, cookies. Qualquer mudanca aqui afeta todo o sistema autenticado.

## Security Infrastructure Surface
Core files:
  - apps/api/src/core/lib/server/security/
  - apps/api/src/common/guards/
  - apps/api/src/common/middleware/
  - apps/api/src/common/filters/
Adjacent surfaces:
  - Authentication
  - All backend endpoints
Risk level: High
Notes: CORS, rate limiting, security headers, auth guards e exception filters sao aplicados globalmente.

## Data Boundary Surface
Core files:
  - lib/client/api.ts
  - hooks/ (all domain hooks)
Adjacent surfaces:
  - All frontend components consuming data
  - All backend API endpoints
Risk level: High
Notes: Envelope contract { data, error }. Mudanca aqui quebra toda a comunicacao frontend-backend.

## Frontend Hooks Surface
Core files:
  - hooks/use-auth.tsx
  - hooks/use-budget.ts
  - hooks/use-transactions.ts
  - hooks/ (all domain hooks)
Adjacent surfaces:
  - Data Boundary (lib/client/api.ts)
  - All frontend components
Risk level: High
Notes: Hooks definem o contrato entre componentes e dados. Mudanca em assinatura ou retorno quebra componentes globalmente.

## Transaction Surface
Core files:
  - apps/api/src/modules/transactions/
  - apps/api/src/core/lib/server/http/transactions-mapper.ts
  - components/transactions/
  - hooks/ (transaction hooks)
Adjacent surfaces:
  - Categories
  - Category Groups
  - Contacts
  - Areas
  - Budget
  - Reports
Risk level: High
Notes: Modulo mais conectado. Mudancas em transactions podem afetar relatorios, orcamentos e categorizacao.

## Categories Surface
Core files:
  - apps/api/src/modules/categories/
  - apps/api/src/core/lib/server/http/categories-mapper.ts
Adjacent surfaces:
  - Transactions
  - Category Groups
  - Budget
  - Reports
Risk level: Medium

## Category Groups Surface
Core files:
  - apps/api/src/modules/category-groups/
Adjacent surfaces:
  - Categories
  - Transactions
Risk level: Medium

## Contacts Surface
Core files:
  - apps/api/src/modules/contacts/
Adjacent surfaces:
  - Transactions
Risk level: Low

## Areas Surface
Core files:
  - apps/api/src/modules/areas/
  - apps/api/src/core/lib/server/http/areas-mapper.ts
Adjacent surfaces:
  - Transactions
  - Reports
Risk level: Medium
Notes: Centros de custo. Usados para segmentacao de transacoes e relatorios.

## Budget Surface
Core files:
  - apps/api/src/modules/budget/
  - apps/api/src/modules/budget-allocations/
  - apps/api/src/core/lib/server/http/budgets-mapper.ts
Adjacent surfaces:
  - Transactions
  - Categories
  - Reports
  - Settings
Risk level: Medium
Notes: Transfer e rollover sao fluxos criticos.

## Reports Surface
Core files:
  - apps/api/src/modules/reports/
Adjacent surfaces:
  - Transactions
  - Categories
  - Budget
  - Areas
Risk level: Medium
Notes: Consome dados de multiplos modulos. Mudancas em qualquer modulo adjacente podem afetar relatorios.

## Settings Surface
Core files:
  - apps/api/src/modules/settings/
Adjacent surfaces:
  - Authentication
  - Budget
Risk level: Low

## Database Surface
Core files:
  - apps/api/prisma/schema.prisma
  - apps/api/prisma/migrations/
  - apps/api/src/infrastructure/database/prisma/
Adjacent surfaces:
  - All backend modules (infrastructure layer)
Risk level: High
Notes: Mudancas no schema afetam todos os modulos. Requer migration e validacao completa.

## HTTP Mappers Surface
Core files:
  - apps/api/src/core/lib/server/http/*-mapper.ts
Adjacent surfaces:
  - All backend modules (presentation layer)
  - Data Boundary (define API contract shape)
Risk level: Medium
Notes: Traduzem entre domain models e respostas HTTP. Definem o formato do contrato da API.
