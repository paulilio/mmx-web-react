Treat this as a Claude Code CLI wrapper around the canonical workflow in .ai/commands/learn.md.

Rules:
- Read .ai/AGENTS.md first.
- Then read the canonical workflow in .ai/commands/learn.md.
- If this file and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this file as the source of truth. It is only a Claude Code CLI wrapper.

User input:
- Run at any point during or after a session when a non-trivial problem was solved.
- No arguments required. Analyze the current session context.

Execution:
- Execute the canonical `learn` workflow.
- Output: skill file draft saved to .aiws/knowledge/ or proposed for ~/.claude/skills/learned/. Confirm with user before saving.
