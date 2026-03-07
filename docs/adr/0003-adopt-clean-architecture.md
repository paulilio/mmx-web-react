# ADR-0003: Adopt layered clean architecture for backend flow

Date: 2026-02-22
Status: Accepted
Supersedes: ADR-XXXX (optional)
Superseded by: ADR-XXXX (optional)

## Context

Business rules were previously spread across hooks and storage logic, increasing coupling and regression risk.

## Decision

Adopt layered flow in server code:
API Route -> Service -> Domain -> Repository -> Prisma.

## Consequences

Positive impacts:

- clearer separation of responsibilities
- easier unit testing of rules in domain/service
- safer incremental migration from mocks to database

Negative impacts:

- more files and abstractions to maintain
- requires strict review discipline to preserve boundaries

## Alternatives Considered

- keep feature logic directly in API routes
- service + repository only (without explicit domain layer)
- full hexagonal architecture with adapters from start
