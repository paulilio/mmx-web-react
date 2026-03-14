# Project Context

## System Purpose
- Product: MMX personal finance platform.
- This repository hosts:
  - frontend: mmx-web-react
  - dedicated backend workspace: apps/api (mmx-api)

## Architectural Baseline
- Backend architecture is final and mandatory:
  - Modular Monolith
  - Domain-Driven Design (DDD)
  - NestJS + Prisma + PostgreSQL
- Canonical decision: docs/adr/0012-backend-architecture.md

## Backend Domains
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

## Security Baseline
- JWT access + refresh tokens.
- Refresh rotation and revocation.
- Cookie-based auth with secure production flags.
- Rate limiting.
- CORS by environment.
- OAuth Google and Microsoft.

## Frontend Data Boundary
- All data access from UI goes through hooks + lib/client/api.ts.
- Keep envelope contract { data, error }.
- In NEXT_PUBLIC_USE_API=true:
  - explicit ApiError behavior
  - no automatic mock fallback
  - external NEXT_PUBLIC_API_BASE uses credentials include

## Core Technologies
- Next.js 14, React 19, TypeScript 5.
- SWR, React Hook Form, Zod, Tailwind v4.
- Node.js 22+, pnpm.

## Environment Variables
- NEXT_PUBLIC_API_BASE
- NEXT_PUBLIC_USE_API
- MMX_APP_ENV
- CORS_ORIGINS_DEV
- CORS_ORIGINS_STAGING
- CORS_ORIGINS_PROD
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- MICROSOFT_CLIENT_ID
- MICROSOFT_CLIENT_SECRET
- MICROSOFT_REDIRECT_URI
- MICROSOFT_TENANT_ID

## AI Contribution Rules
- Keep docs synchronized across README, docs, AGENTS, .github, and .ai files.
- Preserve security invariants and API envelope.
- Validate changes with lint, tests, type-check, and build.
