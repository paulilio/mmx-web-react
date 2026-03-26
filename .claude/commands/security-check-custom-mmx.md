Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/security-check-custom-mmx.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/security-check-custom-mmx.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Interpret the slash command arguments as the module, file, or area to verify against the security baseline.
- If no scope is given, analyze the full codebase following the canonical workflow.

Execution:
- Execute the canonical `security-check-custom-mmx` workflow.
- Output: lista de itens verificados com status (OK / Atencao) e, para cada problema: arquivo, risco e sugestao de correcao.
