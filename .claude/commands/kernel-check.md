Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/kernel-check.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/kernel-check.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Interpret the slash command arguments as context about recent changes, or run without arguments to check based on current git diff.

Execution:
- Execute the canonical `kernel-check` workflow.
- Output: kernel atualizado ou confirmacao de que nenhuma alteracao e necessaria.
