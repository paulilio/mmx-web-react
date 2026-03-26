Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/analyze-task.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/analyze-task.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Interpret the slash command arguments as the task identifier or area to analyze.
- If the task reference is missing or ambiguous, ask for the minimum clarification needed.

Execution:
- Execute the canonical `analyze-task` workflow (6 steps).
- Stop after step 3 (Implementation Plan) and await user approval before proceeding to step 4.
- Output: resultado de cada passo em sequencia.
