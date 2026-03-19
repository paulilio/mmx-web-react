# .aiws — Workspace Operacional

Workspace operacional do projeto MMX.
Segue a estrutura **AI Engineering Workspace (AIWS)** — modelo estruturado de desenvolvimento assistido por IA com governanca de pastas, modelos de trabalho e multi-AI.

Concentra o trabalho em andamento, o historico de execucao e a memoria tecnica do projeto.

Para entender o modelo completo, veja: `tools/aiws/generic-blueprint.md`
Para uso no dia a dia, veja: `tools/aiws/generic-guide-ops.md`

## Estrutura

| Pasta | Proposito |
|---|---|
| `tasks/` | Tarefas — uma pasta por task, independente da complexidade |
| `tasks/backlog/` | Tasks planejadas, ainda nao iniciadas |
| `tasks/doing/` | Tasks em andamento |
| `tasks/done/` | Tasks concluidas — mesma estrutura das ativas |
| `tasks/<tk>/ref/` | Historico e referencias especificas da task — documentos originais, specs, rascunhos |
| `knowledge/` | Memoria tecnica — investigacoes, conceitos, padroes, decisoes, reviews |
| `runs/` | Historico de execucao de tasks |
| `references/` | Referencias globais do projeto — material de pesquisa, seed data, guias externos |
| `references/aiws/gpt-prompt.md` e `v0-instructions.md` | Instrucoes para ferramentas externas (GPT/Claude chat, v0) |
| `references/aiws/gpt-prompt.md` | System prompt para chat GPT/Claude dedicado ao projeto |
| `references/aiws/v0-instructions.md` | Instrucoes para v0 (Vercel) — colar em Project Knowledge |
| `templates/` | Templates obrigatorios para artefatos (task, spec, run, knowledge) |

## Modelos de trabalho

O workspace suporta tres modelos de colaboracao com IA:

| Modelo | Quando usar |
|---|---|
| **AI-driven** | Objetivo claro — IA lidera execucao, voce revisa plano, spec e resultado |
| **Pair Programming** | Objetivo claro, arquitetura aberta — decisoes tomadas juntos |
| **AI como Assistente** | Objetivo em formacao, spike, investigacao — voce define cada passo |

## Relacao com outras camadas

- `.ai/` = Context Kernel — como trabalhar, arquitetura, regras
- `.aiws/` = Workspace Operacional — o que fazer, o que foi feito, o que aprendi
- `.claude/memory/` = Memoria pessoal da AI entre sessoes
