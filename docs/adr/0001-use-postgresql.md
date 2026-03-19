# ADR-0001: Use PostgreSQL as primary database

Date: 2026-02-20
Status: Accepted
Supersedes: -
Superseded by: -

## Context

The project started with mock-first persistence in `localStorage`, but production requires relational consistency, transactional safety, and scalable querying.

## Decision

Use PostgreSQL as the primary database and Prisma as ORM/migration layer.

## Consequences

Positive impacts:

- strong ACID guarantees for financial data
- mature SQL ecosystem and tooling
- clear migration workflow with Prisma

Negative impacts:

- database setup and operational overhead
- requires schema migration discipline

## Alternatives Considered

- SQLite (limited for multi-user production scale)
- MongoDB (weaker fit for relational finance model)
- keep `localStorage` only (not production-safe)
