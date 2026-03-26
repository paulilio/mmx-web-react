---
name: spec-review
description: Faz revisao arquitetural de uma spec antes da implementacao.
argument-hint: caminho do 3-spec.md ou contexto da task capsule
agent: Ask
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/spec-review.md](../../.ai/commands/spec-review.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/spec-review.md](../../.ai/commands/spec-review.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

User input:
- Interpret the slash command arguments as the spec file path, task identifier, or capsule context.
- If the spec file is not identified, ask for the minimum clarification needed.

Execution:
- Execute the canonical `spec-review` workflow.
- Produce the required architecture review output.
- If the risk score is high, explicitly stop before implementation.
