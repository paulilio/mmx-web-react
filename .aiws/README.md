# .aiws — Workspace Operacional

Workspace operacional do projeto MMX.
Segue a estrutura **AI Engineering Workspace (AIWS)** — modelo estruturado de desenvolvimento assistido por IA com governanca de pastas, modelos de trabalho e multi-AI.

Concentra o trabalho em andamento, o historico de execucao e a memoria tecnica do projeto.

Para entender o modelo completo, veja: `references/aiws/generic-blueprint.md`
Para uso no dia a dia, veja: `references/aiws/generic-guide-ops.md`

## Estrutura

| Pasta | Proposito |
|---|---|
| `tasks/` | Tarefas — uma pasta por task, independente da complexidade |
| `tasks/backlog/` | Tasks planejadas, ainda nao iniciadas |
| `tasks/done/` | Tasks concluidas — mesma estrutura das ativas |
| `knowledge/` | Memoria tecnica — investigacoes, conceitos, padroes, decisoes, reviews |
| `runs/` | Historico de execucao de tasks |
| `references/` | Referencias externas e material de pesquisa |
| `references/aiws/` | Guias e arquivos customizados do modelo AIWS |
| `references/aiws/generic-blueprint.md` | Blueprint do modelo AIWS — instalacao, estrutura, camadas, governanca |
| `references/aiws/generic-guide-ops.md` | Guia operacional — como criar tasks, executar comandos, pipelines |
| `references/aiws/commands/aiws_install.py` | Script Python para instalar o AIWS em qualquer repositorio |
| `references/aiws/commands/init-kernel.md` | Prompts para gerar o Context Kernel com IA apos a instalacao |
| `references/aiws/commands/init-custom.md` | Prompts para gerar os arquivos custom do projeto |
| `references/aiws/model/` | Modelos de referencia copiados pelo script (ai-commands/, templates/) |
| `references/aiws-custom/custom-workspace-guide.md` | Guia customizado do projeto — adaptacoes especificas |
| `references/aiws-custom/custom-gpt-prompt.md` | System prompt para chat GPT/Claude dedicado ao projeto |
| `references/aiws-custom/custom-v0-instructions.md` | Instrucoes para v0 (Vercel) — colar em Project Knowledge |
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
