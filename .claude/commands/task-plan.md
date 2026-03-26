Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/task-plan.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/task-plan.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Interpret the slash command arguments as the task identifier, task path, or task context to plan.
- If the task reference is missing or ambiguous, ask for the minimum clarification needed.

Execution:
- Execute the canonical `task-plan` workflow.
- Output: task atualizada com Plan e Code Surface definidos. Apresentar ao usuario para aprovacao.
