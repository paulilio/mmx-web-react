# ADR-0011: Validate inputs in API layer and business rules in domain layer

Date: 2026-03-06
Status: Accepted
Supersedes: -
Superseded by: -

## Context

The backend must reject malformed requests early and prevent invalid business states before persistence.

## Decision

Use two validation levels:

- API layer validates request shape and required fields
- Domain layer validates business invariants and state transitions

## Consequences

Positive impacts:

- stronger protection against invalid data entering the system
- clear separation between transport validation and business validation
- safer long-term evolution of rules

Negative impacts:

- some validation overlap between layers
- requires discipline to avoid contradictory validation messages

## Alternatives Considered

- validate only in API layer
- validate only in domain layer
- validate only at database constraints level
