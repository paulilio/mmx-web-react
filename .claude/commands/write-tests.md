Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/write-tests.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/write-tests.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Interpret the slash command arguments as the task, module, or file context for which tests should be written.
- If the context is missing or ambiguous, ask for the minimum clarification needed.

Execution:
- Execute the canonical `write-tests` workflow.
- Output: arquivos de teste criados. Confirmar que testes falham antes da implementacao (red phase).
