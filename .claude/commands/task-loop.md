Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/task-loop.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/task-loop.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Interpret the slash command arguments as the task identifier or task context.
- If the task is clearly a feature with architectural decisions, spike, or structural refactor, warn the user and suggest using start-task + task-plan instead.

Execution:
- Execute the canonical `task-loop` workflow.
- Output: task concluida, validada, run registrado, task movida para done/.
