---
name: task-done
description: Finaliza uma task, registra run, move para done e verifica conhecimento relevante.
argument-hint: task=TK-XXX ou caminho da task
agent: agent
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/task-done.md](../../.ai/commands/task-done.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/task-done.md](../../.ai/commands/task-done.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

User input:
- Interpret the slash command arguments as the task identifier, task path, or completion context.
- If the task reference is missing or ambiguous, ask for the minimum clarification needed.

Execution:
- Execute the canonical `task-done` workflow.
- Create knowledge artifacts only when the canonical criteria are met.
- Run kernel-check if the canonical workflow says it is required.
