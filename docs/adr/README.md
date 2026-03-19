# Architecture Decision Records (ADR)

## Purpose

ADR documents record **important architectural decisions** made in the project.

They explain:

- what decision was made
- why the decision was made
- what alternatives were considered
- what consequences the decision brings

This prevents loss of technical context over time and helps new developers understand the system architecture quickly.

---

## When to Create an ADR

Create an ADR when a decision affects the **architecture or structure of the system**.

Common cases:

- choice of database
- choice of framework
- authentication strategy
- API architecture
- deployment platform
- testing strategy
- messaging or event architecture
- architectural patterns (Clean Architecture, Hexagonal, etc.)

Do not create ADR for small implementation details.

---

## Where ADR Files Are Stored

All ADR files are stored in the repository.

Example structure:

\`\`\`
docs/
  adr/
    0001-use-postgresql.md
    0004-auth-local-session-first.md
    0005-adopt-backend-jwt-auth.md
    ...
\`\`\`

Rules:

- one decision per file
- files are numbered sequentially (`0001`, `0002`, `0003`...)
- numbers must never change
- ADR files should not be deleted in normal operation

Exception policy:
- conflicting ADRs can be deleted when a newer accepted ADR explicitly replaces the architecture baseline and the team requests repository cleanup
- when this happens, keep the replacement ADR as the single source of truth and document the cleanup in commit/PR notes

If a decision changes, create a **new ADR** that supersedes the old one.

---

## ADR File Structure

Each ADR should follow a simple and consistent format.

\`\`\`
# ADR-0001: Title of the decision

Date: YYYY-MM-DD  
Status: Proposed | Accepted | Rejected | Deprecated | Superseded
Supersedes: -
Superseded by: -

## Context

Describe the problem or situation that required this decision.

## Decision

Describe the chosen solution.

## Consequences

Positive impacts:

- benefit 1
- benefit 2

Negative impacts:

- tradeoff 1
- tradeoff 2

## Alternatives Considered

- option A
- option B
- option C
\`\`\`

The document should be short and direct.
Typical size: **20 to 50 lines**.

---

## ADR Status Definitions

Proposed
The decision is being discussed.

Accepted
The decision was approved and implemented.

Rejected
The decision was evaluated and explicitly not adopted.

Deprecated
The decision is no longer recommended.

Superseded
The decision was replaced by another ADR.

Example:

\`\`\`
Superseded by ADR-0007
\`\`\`

---

## Best Practices

Keep ADR documents simple and concise.

Use clear technical reasoning.

Avoid long discussions or implementation details.

Focus on **architecture and system design decisions**.

Always commit ADR files together with the architectural change they describe.

---

## Benefits for the Team

ADR provides several advantages:

Faster onboarding
New developers understand architectural choices quickly.

Better long term maintenance
Teams know why the system was designed a certain way.

Reduced repeated discussions
Past decisions remain documented.

Clear technical history
Architecture evolution becomes traceable over time.

---

## Quick Example

\`\`\`
# ADR-0001: Use PostgreSQL as primary database

Date: 2026-03-06
Status: Accepted
Supersedes: -
Superseded by: -

## Context
The system requires a relational database with strong transactional guarantees.

## Decision
Use PostgreSQL hosted on Supabase.

## Consequences

Positive impacts:
- reliable ACID transactions
- mature ecosystem

Negative impacts:
- requires schema migration management

## Alternatives Considered
- MySQL
- MongoDB
\`\`\`
