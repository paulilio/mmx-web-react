---
name: ship
description: Prepara o envio das mudancas, executa checks necessarios e gera descricoes de PR e Jira.
argument-hint: task=TK-XXX ou contexto do envio
agent: agent
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/ship.md](../../.ai/commands/ship.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/ship.md](../../.ai/commands/ship.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

Execution:
- Execute the canonical `ship` workflow.
- Respect repository safety rules from the kernel.
- Generate the PR and Jira outputs defined by the canonical workflow.
