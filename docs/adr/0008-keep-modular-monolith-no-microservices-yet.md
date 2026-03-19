# ADR-0008: Keep modular monolith, do not adopt microservices yet

Date: 2026-03-06
Status: Accepted
Supersedes: -
Superseded by: -

## Context

The team is still consolidating core business flows and security baseline. Splitting into microservices now would add infrastructure and coordination overhead.

## Decision

Keep a modular monolith architecture and postpone microservices until clear scale or autonomy constraints are measured.

## Consequences

Positive impacts:

- lower operational complexity and faster delivery
- simpler local development and debugging
- easier consistency for transactions and auth rollout

Negative impacts:

- independent scaling by bounded context is limited
- stronger need for internal module boundary governance

## Alternatives Considered

- immediate split into domain-based microservices
- split only auth as a separate service
- serverless function-per-feature model
