# ADR-0012: Adopt domain-bounded modular monolith structure for backend

Date: 2026-03-13
Status: Accepted
Supersedes: ADR-0003 (complementary)
Superseded by: ADR-XXXX (optional)

## Context

The backend already follows layered flow (`API -> Service -> Domain -> Repository -> Prisma`), but growth across finance modules (transactions, budget, reports, auth) requires stronger domain boundaries to avoid a disorganized monolith.

## Decision

Keep a modular monolith and formalize domain boundaries by module.

- Each business area is a module: `auth`, `users`, `transactions`, `categories`, `category-groups`, `contacts`, `budget`, `reports`, `settings`, `areas`.
- Controllers stay thin and delegate orchestration to services.
- Domain rules remain isolated in pure domain layer.
- Prisma access is restricted to repository layer.
- Cross-module communication happens via service-level contracts, never by direct repository access.

## Consequences

Positive impacts:

- clearer ownership per domain module
- lower coupling between unrelated business areas
- easier testing of domain rules independent of HTTP
- safer path to future extraction to microservices if needed

Negative impacts:

- requires discipline on module boundaries
- introduces migration work to align existing files with module folders
- may duplicate some helper logic before shared abstractions stabilize

## Alternatives Considered

- Keep current mixed structure without explicit boundaries
- Move immediately to microservices
- Organize only by technical layer (`controllers/services/repositories`) across all domains
