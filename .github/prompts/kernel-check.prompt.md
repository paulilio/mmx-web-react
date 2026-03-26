---
name: kernel-check
description: Verifica se o Context Kernel precisa de atualizacao apos mudancas estruturais.
argument-hint: task=TK-XXX, diff, ou area alterada
agent: agent
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/kernel-check.md](../../.ai/commands/kernel-check.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/kernel-check.md](../../.ai/commands/kernel-check.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

User input:
- Interpret the slash command arguments as the relevant task, diff, or structural change context.
- If the structural scope is unclear, ask for the minimum clarification needed.

Execution:
- Execute the canonical `kernel-check` workflow.
- If no kernel update is needed, state that clearly.
- If an update is needed, identify the file, the reason, and the suggested change before applying edits that require approval.
