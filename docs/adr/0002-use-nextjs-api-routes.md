# ADR-0002: Use Next.js App Router and API Routes

Date: 2026-02-20
Status: Accepted
Supersedes: ADR-XXXX (optional)
Superseded by: ADR-XXXX (optional)

## Context

The project needs a single codebase for frontend and backend evolution, with fast delivery and low operational complexity.

## Decision

Adopt Next.js 14 (App Router) for UI and use `app/api/**` routes as backend HTTP layer.

## Consequences

Positive impacts:

- shared TypeScript stack across UI and API
- faster iteration with one repository
- easier deployment pipeline for early phases

Negative impacts:

- backend scalability boundaries tied to monolith runtime
- requires discipline to avoid mixing UI and server concerns

## Alternatives Considered

- separate frontend and Node API repositories
- NestJS backend with standalone React frontend
- serverless-only architecture from day one
