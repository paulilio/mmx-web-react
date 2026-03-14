# Repository Map

## Top-Level Folders
- app/: Next.js App Router pages and layouts.
- app/api/: local frontend route handlers (technical/local scope only).
- components/: feature UI and shared UI primitives.
- hooks/: frontend domain hooks.
- lib/: frontend adapter, shared utils, and server-side support utilities.
- apps/api/: dedicated NestJS backend (mmx-api).
- prisma/: Prisma schema and migrations.
- docs/: architecture, contracts, deployment, and ADRs.
- scripts/: validation and operational helper scripts.
- docker/scripts/: canonical Docker compose/runtime scripts.
- monitor/runtime/: monitor execution outputs (reports/artifacts/logs).

## Important Frontend Boundary
- lib/client/api.ts: canonical frontend data adapter.
- In API mode, it unwraps envelope and throws explicit ApiError.

## Backend Source of Truth
- apps/api/src: Modular Monolith + DDD implementation.
- apps/api/src/infrastructure/database/prisma: PrismaModule + PrismaService.
- apps/api/prisma/schema.prisma: data model source of truth.

## API Boundary Rules
- apps/api is the official backend for business domains and contracts.
- app/api is limited to local/technical route handlers and must not become a parallel backend.
- Frontend UI/hooks must keep using lib/client/api.ts as the canonical data boundary.

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

## Operational Compatibility
- Legacy paths under scripts/docker are temporary compatibility shims.
- New operational references should target docker/scripts and monitor/runtime.
