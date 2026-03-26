Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/start-task.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/start-task.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Interpret the slash command arguments as the task identifier, task path, or task context to initialize.
- If the task reference is missing or ambiguous, ask for the minimum clarification needed.

Execution:
- Execute the canonical `start-task` workflow.
- Output: resumo da task com Objective, Plan e Code Surface. Aguardar confirmacao do usuario para prosseguir.
