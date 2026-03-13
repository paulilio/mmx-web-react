# ADR-0010: Use Vercel as deployment platform

Date: 2026-03-06
Status: Accepted
Supersedes: -
Superseded by: -

## Context

The application uses Next.js App Router and needs a simple deployment workflow with preview environments and low setup friction.

## Decision

Use Vercel as the primary deployment platform for staging and production.

## Consequences

Positive impacts:

- native optimization and support for Next.js runtime
- straightforward preview deployments per branch/PR
- reduced infrastructure management effort

Negative impacts:

- vendor lock-in risk
- cost growth based on usage and advanced features

## Alternatives Considered

- AWS with custom CI/CD
- Docker + VPS deployment
- Azure App Service
