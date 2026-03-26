---
name: start-task
description: Inicia uma task carregando o kernel e resumindo objetivo, plano e code surface.
argument-hint: task=TK-XXX ou caminho da task
agent: Plan
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/start-task.md](../../.ai/commands/start-task.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/start-task.md](../../.ai/commands/start-task.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

User input:
- Interpret the slash command arguments as the task identifier, task path, or task context to initialize.
- If the task reference is missing or ambiguous, ask for the minimum clarification needed.

Execution:
- Execute the canonical `start-task` workflow.
- Summarize the result for the user with objective, plan, and code surface.
- Ask for confirmation only if the canonical workflow requires it.