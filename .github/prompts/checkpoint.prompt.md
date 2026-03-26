---
name: checkpoint
description: Cria, verifica ou lista checkpoints nomeados durante o desenvolvimento para rastrear estado em tasks longas.
argument-hint: "[create|verify|list] [name]"
agent: agent
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/checkpoint.md](../../.ai/commands/checkpoint.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/checkpoint.md](../../.ai/commands/checkpoint.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

User input:
- Interpret the slash command arguments as: create <name>, verify <name>, or list.

Execution:
- Execute the canonical `checkpoint` workflow.
- Output: checkpoint created/verified/listed with timestamp, git SHA, and delta report when verifying.
