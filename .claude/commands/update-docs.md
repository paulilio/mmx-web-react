Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/update-docs.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/update-docs.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- No arguments required. Analyzes changes from the current session/git diff.
- Optional: pass a scope hint (e.g., "auth module" or "api contracts") to focus the update.

Execution:
- Execute the canonical `update-docs` workflow.
- Output: lista de arquivos atualizados + confirmacao do checklist de governance.
