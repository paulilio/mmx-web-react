---
name: agentic-engineering
description: Opera como engenheiro agentico com decomposicao por unidades, roteamento de modelos e eval-first execution.
argument-hint: "[escopo ou descricao da task]"
agent: Plan
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/agentic-engineering.md](../../.ai/commands/agentic-engineering.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/agentic-engineering.md](../../.ai/commands/agentic-engineering.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

Execution:
- Execute the canonical `agentic-engineering` workflow.
- Apply model routing: Haiku → classification/boilerplate, Sonnet → implementation, Opus → architecture/root-cause.
- Output: unidades decompostas com done conditions, modelo atribuido e criterios de eval.
