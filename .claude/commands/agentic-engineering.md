Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/agentic-engineering.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/agentic-engineering.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Invoke when starting a complex task that involves multiple agents, model routing decisions, or eval-first execution.
- Arguments: optional scope or task description.

Execution:
- Execute the canonical `agentic-engineering` workflow.
- Apply model routing: Haiku for classification/boilerplate, Sonnet for implementation, Opus for architecture/root-cause.
- Apply the 15-minute unit rule for task decomposition.
- Output: decomposed units with done conditions, model assignments, and eval criteria.
