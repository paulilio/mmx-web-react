---
name: task-loop
description: Executa o loop completo para tasks simples, do entendimento ate a finalizacao.
argument-hint: task=TK-XXX ou caminho da task simples
agent: agent
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/task-loop.md](../../.ai/commands/task-loop.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/task-loop.md](../../.ai/commands/task-loop.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

User input:
- Interpret the slash command arguments as the task identifier, task path, or task context.
- If the task scope looks too large, architectural, or ambiguous for `task-loop`, stop and tell the user to use a planning workflow instead.

Execution:
- Execute the canonical `task-loop` workflow end to end.
- Keep changes minimal and scoped to the task.
- Validate according to the canonical workflow before finalizing.