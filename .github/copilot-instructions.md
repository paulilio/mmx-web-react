# Copilot Context Bridge

Treat this file as a bridge to the repository AI kernel, not as a standalone source of truth.

Bridge rules:
- The canonical knowledge, rules, and workflows live in `.ai/`.
- Read the kernel files in the required order before any task.
- Do not treat this file as the final workflow integration layer.
- If GitHub Copilot requires native customization artifacts such as prompt files, custom agents, skills, instructions, or other formally registered wrappers, those artifacts must be treated as wrappers around `.ai/`, not as replacements for it.
- `.ai/commands/` defines canonical workflow specifications. If Copilot needs native slash-command behavior, implement it through Copilot-native wrappers that map back to `.ai/commands/`.
- If no native wrapper is available or necessary for the current task, use this bridge plus the kernel files as the operating context.

Context Kernel location: `.ai/`

Read these files in order before any task:

1. `.ai/AGENTS.md` — operational rules and workflow model
2. `.ai/SYSTEM.md` — system purpose and architecture
3. `.ai/CODEBASE_MAP.md` — codebase map
4. `.ai/CONTEXT_SURFACES.md` — impact surfaces

Workspace operacional: `.aiws/`
