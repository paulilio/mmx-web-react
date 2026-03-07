# ADR-0005: Adopt backend-first auth with bcrypt and JWT

Date: 2026-03-06
Status: Accepted
Supersedes: ADR-0004
Superseded by: ADR-XXXX (optional)

## Context

The system now has Prisma/PostgreSQL and API routes, enabling secure server-side auth. The local session strategy is not acceptable for production.

## Decision

Implement backend auth with password hashing (`bcrypt`/`bcryptjs`) and JWT (`access` + `refresh`) validated in middleware.

## Consequences

Positive impacts:

- secure credential handling and token-based access control
- removes `userId` spoofing risk in protected routes
- aligns auth with backend ownership of identity

Negative impacts:

- more complexity in token lifecycle and refresh flow
- requires stricter secret/env management

## Alternatives Considered

- keep local session strategy
- server session stored in database only
- outsource auth entirely to third-party provider
