Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/spec-review.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/spec-review.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Interpret the slash command arguments as the task identifier or spec file path to review.
- If the spec reference is missing or ambiguous, ask for the minimum clarification needed.

Execution:
- Execute the canonical `spec-review` workflow (10-point evaluation).
- If Risk Score >= 6, block implementation and require spec correction before proceeding.
- Output: Architecture Review com Strengths, Issues, Missing Elements, Recommendations e Risk Score.
