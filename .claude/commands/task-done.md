Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/task-done.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/task-done.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Interpret the slash command arguments as the task identifier to finalize.
- If the task reference is missing or ambiguous, ask for the minimum clarification needed.

Execution:
- Execute the canonical `task-done` workflow.
- Output: task movida para done/, run registrado, knowledge criado se aplicavel, kernel verificado se aplicavel.
