---
name: task-plan
description: Cria ou refina o plano de execucao de uma task com base no kernel do projeto.
argument-hint: task=TK-XXX ou caminho da task
agent: Plan
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/task-plan.md](../../.ai/commands/task-plan.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/task-plan.md](../../.ai/commands/task-plan.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

User input:
- Interpret the slash command arguments as the task identifier, task path, or planning context.
- If the task reference is missing or ambiguous, ask for the minimum clarification needed.

Execution:
- Execute the canonical `task-plan` workflow.
- Produce or refine the plan with clear steps, impact notes, and code surface.
- Present the plan to the user in a reviewable format.