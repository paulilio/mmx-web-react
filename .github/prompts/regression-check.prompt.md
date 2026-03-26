---
name: regression-check
description: Executa a validacao completa do projeto e reporta falhas para investigacao.
argument-hint: escopo opcional ou contexto da task
agent: agent
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/regression-check.md](../../.ai/commands/regression-check.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/regression-check.md](../../.ai/commands/regression-check.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

Execution:
- Execute the canonical `regression-check` workflow.
- If a check fails, investigate and fix only what is required by the canonical workflow and current task context.
- Report a concise validation summary to the user.
