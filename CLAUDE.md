# Context Bridge

Treat this file as a bridge to the repository AI kernel, not as a standalone source of truth.

Bridge rules:
- The canonical knowledge, rules, and workflows live in `.ai/`.
- Read the kernel files in the required order before any task.
- Do not treat this file as the final workflow integration layer.
- If Claude supports or requires platform-specific wrappers, slash commands, or prompt artifacts for a workflow, those artifacts must be treated as wrappers around `.ai/`, not as replacements for it.
- If no native wrapper is available or necessary, use this bridge plus the kernel files as the operating context.

Read these files in order before any task:

1. .ai/AGENTS.md — operational rules and workflow model
2. .ai/SYSTEM.md — system purpose and architecture
3. .ai/CODEBASE_MAP.md — codebase map
4. .ai/CONTEXT_SURFACES.md — impact surfaces

Workspace operacional: .aiws/

## Claude Code CLI — Native Wrappers

Canonical workflows from `.ai/commands/` are registered as Claude Code CLI slash commands in `.claude/commands/`.

Available commands:
- `/start-task` — load kernel and summarize task objective, plan, code surface
- `/task-loop` — full cycle for simple tasks (bugfix, chore)
- `/task-plan` — create or refine execution plan
- `/analyze-task` — deep 6-step analysis for complex tasks
- `/kernel-check` — verify kernel needs update after structural changes
- `/regression-check` — full validation (lint, test, type-check, build)
- `/ship` — commit, push, PR, generate descriptions
- `/task-done` — finalize task, register run, move to done/
- `/write-tests` — write tests before/during implementation
- `/spec-review` — architectural review before implementation
- `/performance-check-custom-mmx` — MMX performance audit
- `/security-check-custom-mmx` — MMX security baseline verification
- `/learn` — extract reusable patterns from session into .aiws/knowledge/ (includes kernel-check + update-docs)
- `/checkpoint` — create/verify/list named checkpoints during long tasks
- `/agentic-engineering` — decompose work into units, route models, eval-first execution
- `/update-docs` — verify and update READMEs, docs/, guides, CODEBASE_MAP and AI bridges
- `/impeccable <intent> [target]` — apply frontend design workflows (audit, polish, critique, harden, distill, animate, …) using `.ai/skills/impeccable/`. Triggered automatically by `.ai/rules/frontend-design.md` on UI changes.

Governance rule: when a new command is created in `.ai/commands/`, create the corresponding wrapper in `.claude/commands/` and `.github/prompts/`. Kernel first, then wrappers.
