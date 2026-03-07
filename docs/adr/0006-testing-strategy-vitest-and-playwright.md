# ADR-0006: Use Vitest for unit tests and Playwright for E2E

Date: 2026-03-06
Status: Accepted
Supersedes: ADR-XXXX (optional)
Superseded by: ADR-XXXX (optional)

## Context

The project needs fast backend feedback on domain/service logic and confidence on critical end-to-end user journeys.

## Decision

Adopt Vitest + Testing Library for unit/component tests and Playwright for E2E scenarios.

## Consequences

Positive impacts:

- fast execution for business-rule regression detection
- strong confidence in critical auth and transaction flows
- good integration with TypeScript and modern tooling

Negative impacts:

- two testing layers require maintenance discipline
- E2E setup/runtime is heavier than unit tests

## Alternatives Considered

- Jest + Cypress
- unit tests only (no E2E)
- E2E-only strategy
