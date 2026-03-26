---
name: performance-check-custom-mmx
description: Analisa performance no MMX com foco em Prisma, SWR, listas e reports.
argument-hint: escopo, task, arquivo ou area do sistema
agent: Ask
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/performance-check-custom-mmx.md](../../.ai/commands/performance-check-custom-mmx.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) and [../../.ai/CODEBASE_MAP.md](../../.ai/CODEBASE_MAP.md) first.
- Then read the canonical workflow in [../../.ai/commands/performance-check-custom-mmx.md](../../.ai/commands/performance-check-custom-mmx.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

User input:
- Interpret the slash command arguments as the code area, task, or file set to inspect.
- If no scope is provided, inspect the most relevant area implied by the current context.

Execution:
- Execute the canonical `performance-check-custom-mmx` workflow.
- Report findings by area with status, file, impact, and suggested correction.
- Do not make code changes unless the user explicitly asks for them.
