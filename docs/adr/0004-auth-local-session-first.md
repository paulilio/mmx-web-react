# ADR-0004: Start auth with local session in mock-first phase

Date: 2026-02-24
Status: Superseded
Supersedes: -
Superseded by: ADR-0005

## Context

At project bootstrap, backend auth endpoints were not yet available and product validation speed was the main priority.

## Decision

Use temporary local session/localStorage auth for initial UX validation and flow prototyping.

## Consequences

Positive impacts:

- immediate feature delivery for login/register UX
- low setup friction during early exploration

Negative impacts:

- insecure for production use
- inconsistent trust boundary (client-controlled session)

## Alternatives Considered

- block auth features until backend was complete
- implement JWT backend before any auth UI
- integrate external identity provider from day one
