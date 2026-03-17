# SYSTEM — O que o sistema faz

## Purpose
MMX: plataforma pessoal de financas.
Repositorio hospeda frontend (mmx-web-react) e backend dedicado (mmx-api em apps/api).

## Architecture Overview
- Frontend: Next.js 14 App Router consumindo REST via lib/client/api.ts.
- Backend: NestJS dedicado em apps/api.
- Backend style: Modular Monolith com DDD.
- Canonical ADR: docs/adr/0012-backend-architecture.md.

## Main Components

### Backend Bounded Contexts (apps/api/src/modules/)
- health
- auth
- transactions
- categories
- category-groups
- contacts
- budget
- budget-allocations
- areas
- settings
- reports (summary, aging, cashflow)

### DDD Layering (por contexto)
- presentation: controllers, transport DTOs
- application: use-cases, ports (interfaces), orchestration
- domain: entities, value objects, domain services/events
- infrastructure: repository implementations, Prisma adapters

## Data Flow
```
UI → hooks → lib/client/api.ts → apps/api (controllers → use-cases → domain → repositories) → PostgreSQL
```

## Tech Stack
- Frontend: Next.js 14, React 19, TypeScript 5, SWR, React Hook Form, Zod, Tailwind v4
- Backend: NestJS, Prisma, PostgreSQL
- Runtime: Node.js 22+, pnpm

## Environment Variables
- NEXT_PUBLIC_API_BASE
- NEXT_PUBLIC_USE_API
- MMX_APP_ENV
- CORS_ORIGINS_DEV / CORS_ORIGINS_STAGING / CORS_ORIGINS_PROD
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI
- MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET / MICROSOFT_REDIRECT_URI / MICROSOFT_TENANT_ID

## Constraints
- Architecture backend is final and mandatory.
- CORS, rate limiting, auth cookies, JWT and refresh store remain centralized.
- Authorization gate and security headers are mandatory.
- OAuth start + callback flows must remain intact.
- No automatic fallback to mock in API mode.
- Keep user-scoped operations with userId isolation.

## Known Limitations
- Operational runtime outputs centralized in runtime/<service>/ (front, api, monitor).
