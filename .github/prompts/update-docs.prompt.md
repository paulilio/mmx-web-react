---
name: update-docs
description: Verifica e atualiza toda a documentacao afetada pelas mudancas da sessao — READMEs, docs/, guides, CODEBASE_MAP e bridges de IA.
argument-hint: "[escopo opcional, ex: auth module]"
agent: agent
---

Treat this prompt as a Copilot-native wrapper around the canonical workflow specification in [../../.ai/commands/update-docs.md](../../.ai/commands/update-docs.md).

Rules:
- Read [../../.ai/AGENTS.md](../../.ai/AGENTS.md) first.
- Then read the canonical workflow in [../../.ai/commands/update-docs.md](../../.ai/commands/update-docs.md).
- If this prompt and the canonical workflow ever diverge, follow the canonical workflow.
- Do not treat this prompt as the source of truth. It is only a Copilot-native wrapper.

Execution:
- Execute the canonical `update-docs` workflow.
- Output: lista de arquivos atualizados + confirmacao do checklist de governance.
