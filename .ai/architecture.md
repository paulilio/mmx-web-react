# Architecture

## High-Level Architecture
- Frontend: Next.js app consuming HTTP REST via lib/client/api.ts.
- Backend: dedicated NestJS service in apps/api.
- Backend style: Modular Monolith with DDD.

## Bounded Context Model (apps/api)
- src/modules/health
- src/modules/auth
- src/modules/transactions
- src/modules/categories
- src/modules/category-groups
- src/modules/contacts
- src/modules/budget
- src/modules/budget-allocations
- src/modules/areas
- src/modules/settings
- src/modules/reports

## DDD Layering Rules
For each context:
- presentation: controllers, transport DTOs
- application: use-cases, ports (interfaces), orchestration
- domain: entities, value objects, domain services/events
- infrastructure: repository implementations, Prisma adapters

Mandatory dependencies:
- presentation -> application
- application -> domain (and ports)
- infrastructure -> application/domain (implements ports)
- domain has no dependency on NestJS/Prisma/HTTP

## Data and Persistence Boundary
- Frontend boundary: lib/client/api.ts.
- Backend persistence boundary: PrismaService in src/infrastructure/database/prisma.
- PrismaClient must not be consumed outside infrastructure.

## Security Architecture
- CORS, rate limiting, auth cookies, JWT and refresh store remain centralized.
- Authorization gate and security headers are mandatory.
- OAuth Google/Microsoft start + callback flows must remain intact.

## Contract Rules
- API envelope: { data, error }.
- No automatic fallback to mock in API mode.
- Keep user-scoped operations with userId isolation.

## Canonical ADR
- docs/adr/0012-backend-architecture.md
