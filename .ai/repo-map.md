# Repository Map

## Top-Level Folders
- app/: Next.js App Router pages and layouts.
- components/: feature UI and shared UI primitives.
- hooks/: frontend domain hooks.
- lib/: frontend adapter, shared utils, and server-side support utilities.
- apps/api/: dedicated NestJS backend (mmx-api).
- prisma/: Prisma schema and migrations.
- docs/: architecture, contracts, deployment, and ADRs.
- scripts/: validation and operational helper scripts.

## Important Frontend Boundary
- lib/client/api.ts: canonical frontend data adapter.
- In API mode, it unwraps envelope and throws explicit ApiError.

## Backend Source of Truth
- apps/api/src: Modular Monolith + DDD implementation.
- apps/api/src/infrastructure/database/prisma: PrismaModule + PrismaService.
- apps/api/prisma/schema.prisma: data model source of truth.

## Canonical Architecture Reference
- docs/adr/0012-backend-architecture.md

## Security-Critical Areas
- backend auth/login/register/refresh/logout and OAuth flows.
- JWT, refresh token rotation/revocation.
- CORS and rate limiting.
- secure cookie behavior in production.

## Build and Validation References
- package.json scripts for lint, tests, type-check and build.
- scripts/validate-env.mjs for environment checks.
