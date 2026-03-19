# ADR-0012 - Backend Architecture

Status
Accepted

Supersedes
- ADR-0002
- ADR-0003

Context
MMX requires a dedicated backend service to replace transitional Next.js API routes.
The target is a production-grade backend with strict domain boundaries, strong security,
and maintainable long-term evolution.

Decision
Adopt a Modular Monolith using NestJS with Domain-Driven Design (DDD) and Prisma.

Execution strategy
- Big Bang refactor (single cutover).
- No legacy coexistence layer.
- No backward architecture compatibility obligations.

Mandatory stack
- Node 22
- NestJS
- TypeScript strict
- Prisma ORM
- PostgreSQL
- pnpm
- Docker-compatible runtime

Target structure

src/
  main.ts
  app.module.ts
  modules/
    health/
    auth/
    transactions/
    categories/
    category-groups/
    contacts/
    budget/
    budget-allocations/
    areas/
    settings/
    reports/
  infrastructure/
    database/prisma/
  common/
  config/

prisma/
  schema.prisma
  migrations/

DDD layering rules
- Each domain module is a bounded context.
- Each bounded context uses four layers:
  - presentation
  - application
  - domain
  - infrastructure
- Domain layer is pure and must not import NestJS, Prisma, or transport concerns.
- Application layer owns use cases and repository ports (interfaces).
- Infrastructure layer implements repository ports with Prisma.
- Controllers remain thin and delegate to use cases.
- Cross-context access via contracts/events only, never direct repository access.

Prisma rules
- Prisma access is centralized through PrismaService.
- PrismaClient must not be used outside infrastructure.
- Schema and migrations have a single source of truth in prisma/.
- Use Prisma transactions for critical flows.

Security invariants to preserve
- JWT auth with access + refresh tokens
- Refresh token rotation and revocation
- Cookie-based auth (HttpOnly, SameSite, Secure in production)
- Rate limiting
- CORS
- OAuth providers: Google and Microsoft

Consequences

Positive
- Strong bounded contexts and clear ownership
- High maintainability and testability
- Predictable scaling path for future extraction
- Single deployment unit with low operational complexity

Negative
- Higher upfront refactor cost due to Big Bang cutover
- Requires strict governance to keep domain boundaries intact
- Temporary delivery slowdown during full rewrite window
