---
name: write-tests
description: Escreve testes para a task seguindo as regras do kernel e a naming convention do projeto.
argument-hint: task=TK-XXX ou contexto do que deve ser testado
agent: agent
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/write-tests.md](../../.ai/commands/write-tests.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first, especially the Testing Rules section.
- Then read the canonical workflow in [../../.ai/commands/write-tests.md](../../.ai/commands/write-tests.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

User input:
- Interpret the slash command arguments as the task identifier, task path, or testing scope.
- If the scope is ambiguous, ask for the minimum clarification needed.

Execution:
- Execute the canonical `write-tests` workflow.
- Keep tests aligned with the task plan and project testing conventions.
- Prefer the red phase behavior when the canonical workflow requires it.