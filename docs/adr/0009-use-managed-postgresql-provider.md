# ADR-0009: Use managed PostgreSQL provider for production

Date: 2026-03-06
Status: Accepted
Supersedes: -
Superseded by: -

## Context

Operating a self-hosted PostgreSQL cluster increases operational load for backups, updates, monitoring, and failover.

## Decision

Use a managed PostgreSQL provider (Supabase or Neon) for production environments.

## Consequences

Positive impacts:

- reduced operational overhead for database reliability
- built-in backup and platform features
- faster setup for staging and production

Negative impacts:

- vendor dependency and pricing constraints
- less low-level control than self-hosted setups

## Alternatives Considered

- self-hosted PostgreSQL on VPS/Kubernetes
- managed PostgreSQL on cloud VM without higher-level tooling
- keep local database only
