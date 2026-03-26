Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/ship.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/ship.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Interpret the slash command arguments as additional context for the commit message or PR description.

Execution:
- Execute the canonical `ship` workflow.
- Confirm with the user before pushing or opening a PR.
- Output: commit criado, push feito, PR aberto (se aplicavel), descricoes para PR e Jira.
