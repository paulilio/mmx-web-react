# AIWS Tasks — Evolução do Modelo

Registro consolidado da evolução do modelo AI Engineering Workspace (AIWS): o que foi implementado e o que pode ser aprimorado no futuro.

Todo o conteúdo foi sintetizado a partir de ~56 arquivos de rascunho e pesquisa produzidos durante o design do modelo (2025-2026).

---

## O que foi feito (`done/`)

| Arquivo | O que cobre |
|---|---|
| [workspace-structure.md](done/workspace-structure.md) | Separação `.ai/` + `.aiws/`, pipeline de tasks, knowledge por domínio, references global vs ref/ por task |
| [ai-commands-workflow.md](done/ai-commands-workflow.md) | Pasta `.ai/commands/` com 10 slash commands, princípio de menos comandos = melhor raciocínio |
| [spec-workflow.md](done/spec-workflow.md) | Workflow AI-driven (humano revisa, IA executa), ciclo de 5 prompts, checklist de spec |

---

## O que pode ser feito (`backlog/`)

| Arquivo | Ideia | Valor |
|---|---|---|
| [task-capsules.md](backlog/task-capsules.md) | Tasks autossuficientes com context + plan + implementation + tests | Alto — elimina re-exploração de código a cada sessão |
| [context-capsules.md](backlog/context-capsules.md) | Pacotes de contexto por módulo do sistema (auth, transactions, budget...) | Alto — IA carrega só o módulo relevante, menos tokens, menos alucinação |
| [runtime-map.md](backlog/runtime-map.md) | Mapa de fluxos de execução real (HTTP → controller → service → DB) | Médio — útil para bugs complexos que cruzam camadas |
| [boot-sequence.md](backlog/boot-sequence.md) | Sequência explícita de carregamento de contexto ao iniciar sessão | Médio — depende de context capsules para ser realmente útil |
| [workspace-local.md](backlog/workspace-local.md) | Pasta `.workspace/` (fora do git) como scratchpad e memória de sessão da IA | Baixo agora — mais útil quando projeto crescer |

---

## Evolução observada nos rascunhos

O design passou por 3 gerações até o modelo atual:

**v1 (Ai Eng WS)** — separação repo versionado vs workspace local, entrypoint único, CONTRACTS.md
**v2 (AI Eng WS v2)** — task capsules, context capsules, system map, runtime map, 4 camadas
**v3 (AI Eng WS v3)** — lean (6 arquivos), superprompt, boot sequence, insight "menos é mais"

**Insight central consolidado do v3:**
> Muitos arquivos de contexto e muitos comandos pioram o raciocínio da IA. O modelo atual com ~6 arquivos de contexto e 10 comandos está no ponto certo. Só adicionar quando houver necessidade real.

---

## Prioridade de backlog sugerida

1. **Context Capsules** — maior impacto imediato, resolve o problema de a IA re-explorar o código
2. **Task Capsules** — complementa context capsules, mais valor em tasks longas
3. **Runtime Map** — baixo custo, alto valor para debugging
4. **Boot Sequence** — só faz sentido após context capsules existirem
5. **Workspace Local** — adiar até projeto ter mais complexidade operacional
