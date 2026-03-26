---
name: analyze-task
description: Analisa profundamente uma task complexa antes de implementar, com pausa para aprovacao apos o plano.
argument-hint: task=TK-XXX ou caminho da task
agent: agent
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/analyze-task.md](../../.ai/commands/analyze-task.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/analyze-task.md](../../.ai/commands/analyze-task.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

User input:
- Interpret the slash command arguments as the task identifier, task path, or task context.
- If the task reference is missing or ambiguous, ask for the minimum clarification needed.

Execution:
- Execute the canonical `analyze-task` workflow step by step.
- Stop after the implementation plan and wait for user approval if the canonical workflow requires it.
- Keep the analysis scoped to the minimum necessary surface.
