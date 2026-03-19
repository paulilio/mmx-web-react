# ADR-0007: Service communication via HTTP boundaries and in-process modules

Date: 2026-03-06
Status: Accepted
Supersedes: -
Superseded by: -

## Context

The project is a modular monolith. It needs clear communication boundaries without adding distributed-system complexity too early.

## Decision

Use HTTP JSON (`{ data, error }`) at external API boundaries and in-process typed module calls between internal services.

## Consequences

Positive impacts:

- stable API contract for frontend/backend integration
- low latency and low operational overhead internally
- easier refactor path to future service extraction if needed

Negative impacts:

- internal coupling still exists within monolith codebase
- requires contract discipline to avoid ad-hoc payload drift

## Alternatives Considered

- event-driven internal communication from start
- internal REST calls between modules in same runtime
- direct repository access from routes/hooks
