# Documentation Governance

## Purpose
- Keep documentation synchronized with the implemented architecture.
- Prevent drift between README, docs, AGENTS, .github instructions, and .ai context.

## Mandatory Trigger Cases
Update docs when changes affect:
- architecture boundaries
- API contracts/envelopes
- auth/security behavior
- runtime/environment behavior
- deployment and operations

## Required Sync Set
- README.md
- docs/**
- AGENTS.md
- .github/copilot-instructions.md
- .ai/project-context.md
- .ai/architecture.md
- .ai/coding-guidelines.md
- .ai/testing-guidelines.md
- .ai/repo-map.md

## Consistency Rules
- Architecture baseline is ADR-0012.
- Backend source of truth is apps/api.
- Frontend data boundary is lib/client/api.ts.
- Envelope contract remains { data, error }.
- In NEXT_PUBLIC_USE_API=true:
  - explicit adapter error behavior
  - no automatic mock fallback
  - external API base requests use credentials include

## PR Checklist
- Execute docs/documentation-governance-checklist.md for architecture/security/runtime updates.
- Report which docs were updated.
- Mark non-applicable checklist items with a brief reason.
