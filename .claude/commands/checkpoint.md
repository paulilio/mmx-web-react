Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/checkpoint.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/checkpoint.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Format: /checkpoint [create|verify|list] [name]
- Examples: /checkpoint create "core-done", /checkpoint verify "feature-start", /checkpoint list

Execution:
- Execute the canonical `checkpoint` workflow.
- Output: checkpoint created/verified/listed with timestamp, git SHA, and delta report when verifying.
