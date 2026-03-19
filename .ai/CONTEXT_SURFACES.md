# CONTEXT SURFACES — O que pode quebrar

Superficies de impacto de mudanca. Consulte antes de alterar codigo para prever efeitos colaterais.

---

## Authentication Surface
Core files:
  - packages/api/src/modules/auth/
  - packages/api/src/core/lib/server/security/ (jwt, cors, password-hash, rate-limit, refresh-session-store)
  - packages/web/lib/client/api.ts (token handling)
  - packages/web/hooks/use-auth.tsx
Adjacent surfaces:
  - Settings
  - Security Infrastructure
  - All authenticated endpoints
Risk level: High
Notes: JWT, refresh rotation, OAuth flows, cookies. Qualquer mudanca aqui afeta todo o sistema autenticado.

## Security Infrastructure Surface
Core files:
  - packages/api/src/core/lib/server/security/
  - packages/api/src/common/guards/
  - packages/api/src/common/middleware/
  - packages/api/src/common/filters/
Adjacent surfaces:
  - Authentication
  - All backend endpoints
Risk level: High
Notes: CORS, rate limiting, security headers, auth guards e exception filters sao aplicados globalmente.

## Data Boundary Surface
Core files:
  - packages/web/lib/client/api.ts
  - packages/web/hooks/ (all domain hooks)
Adjacent surfaces:
  - All frontend components consuming data
  - All backend API endpoints
Risk level: High
Notes: Envelope contract { data, error }. Mudanca aqui quebra toda a comunicacao frontend-backend.

## Frontend Hooks Surface
Core files:
  - packages/web/hooks/use-auth.tsx
  - packages/web/hooks/use-budget.ts
  - packages/web/hooks/use-transactions.ts
  - packages/web/hooks/ (all domain hooks)
Adjacent surfaces:
  - Data Boundary (packages/web/lib/client/api.ts)
  - All frontend components
Risk level: High
Notes: Hooks definem o contrato entre componentes e dados. Mudanca em assinatura ou retorno quebra componentes globalmente.

## Transaction Surface
Core files:
  - packages/api/src/modules/transactions/
  - packages/api/src/core/lib/server/http/transactions-mapper.ts
  - packages/web/components/transactions/
  - packages/web/hooks/ (transaction hooks)
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
  - packages/api/src/modules/categories/
  - packages/api/src/core/lib/server/http/categories-mapper.ts
Adjacent surfaces:
  - Transactions
  - Category Groups
  - Budget
  - Reports
Risk level: Medium

## Category Groups Surface
Core files:
  - packages/api/src/modules/category-groups/
Adjacent surfaces:
  - Categories
  - Transactions
Risk level: Medium

## Contacts Surface
Core files:
  - packages/api/src/modules/contacts/
Adjacent surfaces:
  - Transactions
Risk level: Low

## Areas Surface
Core files:
  - packages/api/src/modules/areas/
  - packages/api/src/core/lib/server/http/areas-mapper.ts
Adjacent surfaces:
  - Transactions
  - Reports
Risk level: Medium
Notes: Centros de custo. Usados para segmentacao de transacoes e relatorios.

## Budget Surface
Core files:
  - packages/api/src/modules/budget/
  - packages/api/src/modules/budget-allocations/
  - packages/api/src/core/lib/server/http/budgets-mapper.ts
Adjacent surfaces:
  - Transactions
  - Categories
  - Reports
  - Settings
Risk level: Medium
Notes: Transfer e rollover sao fluxos criticos.

## Reports Surface
Core files:
  - packages/api/src/modules/reports/
Adjacent surfaces:
  - Transactions
  - Categories
  - Budget
  - Areas
Risk level: Medium
Notes: Consome dados de multiplos modulos. Mudancas em qualquer modulo adjacente podem afetar relatorios.

## Settings Surface
Core files:
  - packages/api/src/modules/settings/
Adjacent surfaces:
  - Authentication
  - Budget
Risk level: Low

## Database Surface
Core files:
  - packages/api/prisma/schema.prisma
  - packages/api/prisma/migrations/
  - packages/api/src/infrastructure/database/prisma/
Adjacent surfaces:
  - All backend modules (infrastructure layer)
Risk level: High
Notes: Mudancas no schema afetam todos os modulos. Requer migration e validacao completa.

## HTTP Mappers Surface
Core files:
  - packages/api/src/core/lib/server/http/*-mapper.ts
Adjacent surfaces:
  - All backend modules (presentation layer)
  - Data Boundary (define API contract shape)
Risk level: Medium
Notes: Traduzem entre domain models e respostas HTTP. Definem o formato do contrato da API.
