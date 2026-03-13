# Documentation Governance

## Purpose
- Keep docs synchronized with real code behavior.
- Prevent drift between README, docs, AGENTS, .github instructions, and .ai context files.

## Mandatory Trigger Cases
Update docs when changes affect:
- architecture boundaries
- API contracts/envelopes
- auth/security behavior
- runtime/env behavior
- operational/deployment workflows

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
- app/api routes must consume services from lib/server/services/index.ts.
- No direct repository/prisma imports in app/api route handlers.
- Keep API envelope contract as { data, error }.
- In NEXT_PUBLIC_USE_API=true, do not add automatic fallback to mock.
- In NEXT_PUBLIC_USE_API=true, external NEXT_PUBLIC_API_BASE requests use credentials: "include".

## PR Checklist
- Use docs/documentation-governance-checklist.md before finalizing.
- Report in PR summary which docs were updated.
- Explicitly mark non-applicable checklist items with a short reason.
