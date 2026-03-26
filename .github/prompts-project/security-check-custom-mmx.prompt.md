---
name: security-check-custom-mmx
description: Analisa regressao de seguranca no MMX com base na Security Baseline do kernel.
argument-hint: escopo, task, arquivo ou area critica
agent: Ask
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/security-check-custom-mmx.md](../../.ai/commands/security-check-custom-mmx.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first, especially the Security Baseline section.
- Then read the canonical workflow in [../../.ai/commands/security-check-custom-mmx.md](../../.ai/commands/security-check-custom-mmx.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

User input:
- Interpret the slash command arguments as the code area, task, or file set to inspect.
- If no scope is provided, inspect the most relevant security surface implied by the current context.

Execution:
- Execute the canonical `security-check-custom-mmx` workflow.
- Report findings by baseline item with status, risk, file, and suggested correction.
- Do not make code changes unless the user explicitly asks for them.
