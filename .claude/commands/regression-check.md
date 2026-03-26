Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/regression-check.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/regression-check.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

Execution:
- Execute the canonical `regression-check` workflow.
- Run all checks: pnpm test:unit, pnpm test:integration, pnpm lint, pnpm type-check, pnpm build, pnpm validate:env -- --env=development.
- Output: todos os checks passando ou lista de problemas encontrados.
