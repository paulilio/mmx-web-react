# AI Engineering Workspace (AIWS)

Blueprint universal para desenvolvimento assistido por IA.
Serve para criar a estrutura do zero, avaliar projetos existentes e ajustar conforme o projeto cresce.

> **Instalacao:** veja [README.md](README.md)

---

## Overview

O **AI Engineering Workspace** e uma estrutura de projeto para desenvolvimento assistido por IA.
Permite que engenheiros e agentes de IA entendam rapidamente o sistema, executem tarefas com seguranca e mantenham rastreabilidade tecnica sem burocracia.

A arquitetura separa tres camadas:
- **Context Kernel** (.ai/) → explica o sistema — fonte unica de verdade
- **AI Bridges** (CLAUDE.md, copilot-instructions.md) → ponteiros para o kernel
- **Workspace Operacional** (.aiws/) → executa o trabalho

---

# Estrutura Geral

\`\`\`text
repo/
  .ai/                          ← Context Kernel (versionado, agnostico de AI)
    AGENTS.md                   ← Regras operacionais para qualquer AI
    SYSTEM.md                   ← Proposito, arquitetura, componentes
    CODEBASE_MAP.md             ← Mapa modular do codigo
    CONTEXT_SURFACES.md         ← Superficies de impacto de mudanca
    commands/                   ← Biblioteca de comandos reutilizaveis (multi-AI)
  CLAUDE.md                     ← Ponte: Claude Code → .ai/
  .github/
    copilot-instructions.md     ← Ponte: Copilot → .ai/
  .aiws/                      ← Workspace Operacional
    tasks/
    knowledge/
    runs/
    references/
    templates/
  src/
  docs/                         ← Documentacao tecnica detalhada
    README.md                   ← Indice navegavel (lido automaticamente por AI e GitHub)
    adr/                        ← Architecture Decision Records
    ...
\`\`\`

---

# Checklist de Setup (do zero)

Use este checklist ao iniciar um novo projeto com o modelo.

## Context Kernel (.ai/)
- [ ] Criar pasta `.ai/`
- [ ] Criar `AGENTS.md` — regras operacionais, convencoes, validacao, governance
- [ ] Criar `SYSTEM.md` — proposito, arquitetura, stack, componentes, constraints
- [ ] Criar `CODEBASE_MAP.md` — modulos funcionais com entry points, dependencies, critical paths
- [ ] Criar `CONTEXT_SURFACES.md` — superficies de impacto com risk level
- [ ] Criar pasta `.ai/commands/` com os comandos base

## AI Bridges
- [ ] Criar `CLAUDE.md` na raiz apontando para `.ai/` (se usar Claude Code)
- [ ] Criar `.github/copilot-instructions.md` apontando para `.ai/` (se usar Copilot)
- [ ] Criar `.cursorrules` na raiz (se usar Cursor)

## Workspace Operacional (.aiws/)
- [ ] Criar pasta `.aiws/`
- [ ] Criar `.aiws/tasks/` — tarefas ativas (uma pasta por task)
- [ ] Criar `.aiws/tasks/backlog/` — tarefas planejadas, ainda nao iniciadas
- [ ] Criar `.aiws/tasks/done/` — tarefas concluidas (mesma estrutura das ativas)
- [ ] Criar `.aiws/knowledge/` — aprendizados tecnicos (inv-*, con-*, pat-*, dec-*, rev-*)
- [ ] Criar `.aiws/runs/` — historico de execucao de tasks
- [ ] Criar `.aiws/references/` — referencias de produto, guias e prompts
- [ ] Criar `.aiws/templates/` com os templates base (`task.md`, `task-capsule/`, e templates de knowledge/run)

## docs/
- [ ] Criar `docs/README.md` como indice navegavel
- [ ] Criar `docs/adr/` para decisoes arquiteturais

## Validacao
- [ ] Cada AI consegue ler o kernel e entender o sistema sem explorar o repositorio
- [ ] A ordem de leitura esta definida no AGENTS.md
- [ ] Os templates estao referenciados no AGENTS.md

---

# Camada 1 — Context Kernel (.ai/)

O Context Kernel contem os documentos que explicam o sistema para engenheiros e agentes de IA.
Esses arquivos mudam pouco e servem como referencia permanente.
Ficam dentro de `.ai/` — nome agnostico, funciona com qualquer ferramenta de IA.

| Arquivo | Funcao |
|---|---|
| `AGENTS.md` | Manual operacional — como a AI deve trabalhar |
| `SYSTEM.md` | O que o sistema faz — proposito, arquitetura, componentes |
| `CODEBASE_MAP.md` | Onde achar o codigo — mapa modular |
| `CONTEXT_SURFACES.md` | O que pode quebrar — superficies de impacto |

---

# AGENTS.md

## Funcao
Manual operacional da IA. Define como agentes devem trabalhar no projeto.

## Conteudo recomendado
\`\`\`
Engineering Principles
Context Reading Order
Code Change Rules
Coding Conventions
Testing Rules
Security Baseline
Validation Checklist
Documentation Governance
Workspace Operacional (.aiws/)
Comandos (.ai/commands/)
\`\`\`

## Ordem de leitura da IA
\`\`\`
1. .ai/AGENTS.md            ← regras de como trabalhar
2. .ai/SYSTEM.md            ← entender o sistema
3. .ai/CODEBASE_MAP.md      ← localizar o codigo
4. Task file (se aplicavel)  ← entender o que fazer
5. .ai/CONTEXT_SURFACES.md  ← avaliar impacto do que vai mudar
\`\`\`
A task vem antes das surfaces para que a AI saiba o que vai alterar antes de avaliar impacto.

## Limite recomendado
200 linhas. Se ultrapassar, revisar e extrair detalhes para `docs/`.

---

# SYSTEM.md

## Funcao
Explica o sistema em nivel conceitual.
Responde: qual o objetivo, como a arquitetura funciona, quais os principais componentes.

## Conteudo recomendado
\`\`\`
Purpose
Architecture Overview
Main Components
Data Flow
Tech Stack
Environment Variables
Constraints
Known Limitations
\`\`\`

## Limite recomendado
150-200 linhas. Detalhes arquiteturais profundos vao em `docs/architecture/`.

---

# CODEBASE_MAP.md

## Funcao
Mapa modular do codigo. Ajuda a IA a localizar rapidamente onde cada funcionalidade esta.
E o arquivo com maior impacto em qualidade de resposta da AI — priorizá-lo reduz 80% dos erros de localizacao.

## Estrutura recomendada por modulo
\`\`\`
## Module: [nome]
Purpose: [descricao curta]
Core files:
  - path/to/file.ts
Entry points:
  - POST /api/endpoint
Dependencies:
  - [modulos dos quais depende]
Tests:
  - tests/module/
\`\`\`

## Critical Paths
Secao no final do CODEBASE_MAP que descreve fluxos end-to-end do sistema.
Ajuda a AI a entender quem chama quem em cenarios reais.
\`\`\`
User login flow:
  frontend/login → hooks/use-auth → lib/api.ts
  → api/auth/controller → use-case → domain → database
\`\`\`

## Regras
- Organizar por modulos funcionais (nao por estrutura de pastas)
- Listar apenas arquivos centrais
- Manter cada modulo com ate 20 linhas
- Usar "Dependencies" (nao "Related modules") — indica direcao da dependencia
- Incluir Critical Paths para fluxos end-to-end principais
- Nao duplicar informacao que ja esta em CONTEXT_SURFACES.md

## Limite recomendado
10-15 modulos. Se o projeto crescer alem disso, considerar splitting por dominio.

---

# CONTEXT_SURFACES.md

## Funcao
Define superficies de impacto de mudanca.
Ajuda a prever quais partes do sistema podem ser afetadas por uma alteracao.

## Estrutura recomendada por surface
\`\`\`
## [Nome] Surface
Core files:
  - path/to/files
Adjacent surfaces:
  - [surface relacionada]
Risk level: High | Medium | Low
Notes: [contexto adicional]
\`\`\`

## Limite recomendado
Apenas superficies criticas. Se crescer muito, revisar se nao ha sobreposicao com CODEBASE_MAP.

---

# Comandos (.ai/commands/)

Biblioteca de comandos reutilizaveis. Cada task seleciona os comandos aplicaveis no Plan — nao ha pipeline fixo.

## Formato de cada comando (agnostico de AI)
\`\`\`
# command-name
## Description — o que faz (uma frase)
## Steps — passos que a AI executa
## Output — o que a AI produz ao final
\`\`\`

## Comandos base recomendados

| Comando | O que faz |
|---|---|
| `task-loop` | Loop unico para tasks simples (bugfix, chore) — ciclo completo automatico |
| `start-task` | Ler contexto do kernel e entender a task |
| `task-plan` | Criar/refinar plano, identificar Code Surface |
| `analyze-task` | Analise profunda em 6 passos antes de implementar — para tasks complexas com multiplos modulos ou risco de regressao |
| `spec-review` | Revisao arquitetural da spec antes de implementar — avalia clareza, completude e risco |
| `write-tests` | Escrever testes antes ou durante implementacao |
| `regression-check` | Validacao tecnica completa (lint, test, type-check, build) |
| `task-done` | Finalizar task, registrar run, mover para done/, kernel-check se aplicavel |
| `ship` | Commit, push, PR, gerar descricoes para PR e Jira |
| `kernel-check` | Verificar se o kernel precisa de atualizacao apos mudancas estruturais |

## ship — Output Templates
O comando `ship` gera descricoes prontas para copiar:

**PR Description:**
\`\`\`
## Summary — bullet points do que foi feito
## Changes — lista de mudancas
## Code Surface — arquivos modificados
## Testing — checklist de testes
## Related — task e ticket Jira
\`\`\`

**Jira / Issue Comment:**
\`\`\`
## O que foi feito — resumo curto
## Detalhes tecnicos — mudancas relevantes
## PR — link
## Proximos passos — pendencias
\`\`\`

---

# Camada 2 — AI Bridges

Cada ferramenta de IA le contexto de um lugar diferente.
Em vez de duplicar conteudo, criamos arquivos-ponte que apontam para o kernel.

| Ferramenta | Arquivo-ponte | Onde fica | Modo |
|---|---|---|---|
| Claude Code | `CLAUDE.md` | raiz do repo | Automatico |
| GitHub Copilot | `copilot-instructions.md` | `.github/` | Automatico |
| Cursor | `.cursorrules` | raiz do repo | Automatico |
| OpenAI Codex | `AGENTS.md` | raiz do repo | Automatico |
| v0 (Vercel) | `custom-v0-instructions.md` | `.aiws/references/aiws/` | Manual — colar em Project → Knowledge |
| ChatGPT / Claude chat | `custom-gpt-prompt.md` | `.aiws/references/aiws/` | Manual — colar no system prompt do chat |

## Chat dedicado para duvidas rapidas (GPT Prompt)

Alem das ferramentas integradas ao editor, e util ter um **chat dedicado para duvidas rapidas do dia a dia** — sem precisar abrir o projeto, sem contexto de codigo, apenas um assistente que ja conhece o sistema.

Esse chat serve para:
- Duvidas rapidas de codigo sem abrir o editor
- Discussoes de arquitetura e tradeoffs
- Decisoes de produto: escopo, priorizacao, risco
- Interpretar tasks, bugs ou discussoes tecnicas do time
- Planejamento de sprint e estimativas

**Como criar:**
1. Criar um arquivo `custom-gpt-prompt.md` em `.aiws/references/aiws/`
2. Colar o conteudo como system prompt em um chat GPT/Claude dedicado
3. O chat ja conhece o sistema e o time — voce chega e pergunta direto

**Estrutura recomendada do prompt:**
\`\`\`
Contexto do projeto — o que e o sistema, stack, modulos principais
Time — papeis relevantes (product, tech lead, qa, dev, scrum master)
Ferramentas — Jira, Azure DevOps, GitHub, etc.
Para que uso — tipos de duvidas e interacoes esperadas
Como ajudar — tom, formato de resposta, nivel de detalhe
\`\`\`

O arquivo e independente — nao e lido por nenhuma ferramenta automaticamente. E apenas um artefato salvo em `references/` para voce encontrar quando precisar recriar o chat.

## Estrutura de uma ponte
\`\`\`markdown
# Context
Read these files in order before any task:
1. .ai/AGENTS.md
2. .ai/SYSTEM.md
3. .ai/CODEBASE_MAP.md
4. .ai/CONTEXT_SURFACES.md
\`\`\`

**Principio: uma fonte (.ai/), multiplos ponteiros. Zero duplicacao de conteudo entre ferramentas.**

## Compatibilidade de comandos por ferramenta

| Ferramenta | Suporte a `.ai/commands/` |
|---|---|
| Claude Code | Nativo — `/comando` funciona direto |
| Cursor | Nativo — `/comando` funciona direto |
| Copilot | Semi-manual — requer AI Command Dispatcher |
| v0 | Nao suporta — foco em UI, usar Project Instructions |
| Outros | Manual — referenciar arquivo diretamente |

O **AI Command Dispatcher** no `AGENTS.md` resolve a compatibilidade com Copilot e outras ferramentas.
Quando presente, qualquer AI interpreta `/comando` como instrucao para ler `.ai/commands/{comando}.md` e executar.

---

# Camada 3 — Workspace Operacional (.aiws/)

Concentra o trabalho em andamento. Pode ser versionado, ignorado pelo git, ou mantido localmente — depende da preferencia do time.

\`\`\`
.aiws/
  tasks/              ← tarefas (ativas, backlog, done) — UMA PASTA POR TASK
    backlog/          ← planejadas, ainda nao iniciadas
    done/             ← concluidas (mesma estrutura das ativas)
  knowledge/          ← aprendizados tecnicos persistentes (inv-*, con-*, pat-*, dec-*, rev-*)
  runs/               ← historico de execucao — o que foi feito em cada sessao de trabalho
  references/         ← referencias externas, guias, prompts de AI, docs de produto
  templates/          ← templates obrigatorios — copiar daqui ao criar artefatos novos
\`\`\`

**Regra de governanca:** estas sao as unicas pastas validas em `.aiws/`. Nao criar pastas fora desta estrutura.
Se uma informacao nao se encaixa em nenhuma pasta, verificar:
- E uma tarefa? → `tasks/`
- E um aprendizado ou decisao tecnica? → `knowledge/`
- E um registro do que foi executado? → `runs/`
- E uma referencia externa ou guia? → `references/`
- E um template para reutilizar? → `templates/`

Subpastas dentro de cada uma dessas sao criadas conforme necessidade — nao antes.

---

## tasks/

Toda task fica em uma **pasta propria** dentro de `tasks/`, independente da complexidade.
As pastas `backlog/` e `done/` sao criadas quando necessario.

\`\`\`
tasks/
  backlog/                   ← tasks planejadas, ainda nao iniciadas
    tk-007-nome/
      1-simple-task.md
  tk-005-nome/               ← task ativa (simples)
    1-simple-task.md
  tk-006-nome/               ← task ativa (capsule / multiplas fases)
    1-task.md
    2-plan.md
    3-spec.md
    4-execute.md
    5-phase-1.md
    6-phase-2.md
  done/                      ← mesma estrutura, so muda de pasta
    tk-001-nome/
      1-simple-task.md
    tk-002-nome/
      1-task.md
      2-plan.md
      3-spec.md
      4-execute.md
\`\`\`

A numeracao como prefixo garante ordenacao natural dos arquivos dentro da pasta.

### Task simples — 1-task.md
Template em `.aiws/templates/task.md`. Secoes:
\`\`\`
Type           — feature | bugfix | spike | refactor | chore
Objective      — uma frase, o que precisa ser feito
Context        — por que precisa ser feito, links para references
Plan           — checklist de etapas, usando comandos de .ai/commands/ quando aplicavel
Code Surface   — arquivos relevantes para a task
Constraints    — restricoes que limitam a implementacao
Validation     — como verificar que esta correto
Definition of Done — criterios de aceite
\`\`\`

### Pipelines sugeridos por tipo
Sao sugestoes, nao regras. Cada task adapta conforme necessidade.

| Type | Pipeline sugerido |
|---|---|
| feature simples | start-task → task-plan → write-tests → regression-check → task-done (+ kernel-check) → ship |
| feature AI-driven | start-task → analyze-task → **spec-review** → write-tests → regression-check → task-done (+ kernel-check) → ship |
| bugfix simples | **task-loop** → ship |
| bugfix complexo | start-task → **analyze-task** → regression-check → task-done → ship |
| spike / exploracao | start-task → task-plan → task-done |
| refactor | start-task → regression-check → task-done (+ kernel-check) → ship |
| chore | **task-loop** |

- `analyze-task` substitui `task-plan` em tasks com multiplos modulos ou risco de regressao
- `spec-review` entra apos o plano no modelo AI-driven — garante que a spec esta pronta antes de implementar

### Code Surface
Campo dentro da task que define os arquivos mais relevantes:
\`\`\`
Code Surface:
  src/api/auth/loginController.ts
  src/middleware/rateLimiter.ts
  tests/auth/login.test.ts
\`\`\`
Reduz a necessidade de explorar o repositorio inteiro.

---

## knowledge/

Memoria tecnica do projeto. Artefatos diferenciados por prefixo no nome do arquivo.

| Prefixo | Tipo | Template | Quando criar |
|---|---|---|---|
| `inv-*` | Investigation | `investigation.md` | Bug, problema, exigiu investigacao de logs ou multiplos modulos |
| `con-*` | Concept | `concept.md` | Explica como o sistema funciona, revela fluxo ou relacao entre componentes |
| `pat-*` | Pattern | `pattern.md` | Padrao de implementacao reutilizavel identificado |
| `dec-*` | Decision | `decision.md` | Escolha entre opcoes com trade-off relevante |
| `rev-*` | Review | `review.md` | Sob demanda — usuario quer estudar o que foi implementado |

### Regra de decisao (usada no task-done)
\`\`\`
Foi dificil entender? Exigiu investigacao?     → inv-*
Explica como o sistema funciona?               → con-*
Pode ser reutilizado como padrao?              → pat-*
Houve escolha entre opcoes com trade-off?      → dec-*
Usuario pediu revisao do que foi implementado? → rev-*
Nenhuma condicao verdadeira?                   → nao gerar documento
\`\`\`

---

## runs/

Historico de execucao de tarefas. Nome sugerido: `YYYY-MM-DD-nome-da-task.md`

Conteudo tipico:
\`\`\`
Task
Plan
Files modified
Tests executed
Result
Next steps
\`\`\`

---

## references/

Referencias de produto e mercado que guiam o desenvolvimento.
Formato livre — cada referencia tem estrutura propria.
Nao tem template — conteudo varia demais para padronizar.

---

## templates/

Templates obrigatorios para manter consistencia entre multiplas IAs.

| Template | Prefixo | Onde salvar | Quando criar |
|---|---|---|---|
| `task.md` | tk-XXX | `tasks/tk-XXX-nome/1-simple-task.md` | Task simples — objetivo direto, etapas claras |
| `task-capsule/` | tk-XXX | `tasks/tk-XXX-nome/` | Task complexa com multiplas fases ou varios dias |
| `3-spec.md` | — | `tasks/tk-XXX-nome/3-spec.md` | Task AI-driven — especificacao tecnica antes de implementar |
| `investigation.md` | inv-* | `knowledge/` | Bug ou problema exige analise de causa raiz |
| `concept.md` | con-* | `knowledge/` | Explica como o sistema funciona ou revela fluxo entre componentes |
| `pattern.md` | pat-* | `knowledge/` | Padrao de implementacao reutilizavel identificado |
| `decision.md` | dec-* | `knowledge/` | Escolha entre opcoes com trade-off relevante |
| `review.md` | rev-* | `knowledge/` | Sob demanda — usuario quer estudar o que foi implementado |
| `run.md` | (data-nome) | `runs/` | Ao finalizar a execucao de uma task |

---

# docs/ — Documentacao Tecnica Detalhada

A pasta `docs/` complementa o Context Kernel com documentacao mais profunda.

## Diferenca entre .ai/ e docs/

| `.ai/` (Context Kernel) | `docs/` |
|---|---|
| Carregado pela AI em toda conversa | Consultado sob demanda |
| Enxuto e operacional | Detalhado e explicativo |
| Define como trabalhar | Explica como o sistema funciona |

## Estrutura recomendada

\`\`\`
docs/
  README.md                     ← Indice navegavel — sempre atualizado
  system-overview.md            ← Onboarding tecnico detalhado
  architecture.md               ← Visao arquitetural aprofundada
  api-contracts.md              ← Contratos de API
  local-development.md          ← Como rodar localmente
  deployment.md                 ← Como fazer deploy
  adr/                          ← Architecture Decision Records
    README.md
    0001-*.md
    ...
\`\`\`

## README.md como indice

O `docs/README.md` e lido automaticamente por GitHub e pela maioria das ferramentas de AI.
Funciona como mapa da documentacao — qualquer AI ou engenheiro novo encontra o doc certo sem explorar a pasta.

**Regra:** sempre que um novo documento for criado em `docs/`, adicionar uma entrada no `README.md`.

## Quando criar subpastas

Subpastas (`architecture/`, `guides/`, `api/`) so valem quando houver 5+ documentos por categoria.
Comece flat — subpastas emergem do uso.

---

# Modelos de Trabalho

O workspace suporta tres modelos de colaboracao com IA. Escolha o modelo conforme o tipo e clareza da task.

---

## 1. AI-driven

**Quando usar:** task clara, objetivo definido, IA lidera a execucao. Voce atua como tech lead e revisor.

**Papel humano:** revisar em 3 momentos — plano, spec, resultado final. Intervir no codigo apenas para ajustes pequenos.

**Pipeline:**
\`\`\`
start-task → analyze-task → [revisar plano] → spec-review → [revisar spec] → write-tests → regression-check → [revisar resultado] → task-done → ship
\`\`\`

**O que a IA faz:** entende o sistema, planeja, gera spec, implementa, valida.
**O que voce faz:** define o objetivo, aprova plano e spec, revisa resultado final.

**Regra da spec:** quanto mais clara a spec (goal, scope, architecture, data contracts, execution flow, edge cases), melhor a implementacao automatica. Spec fraca = implementacao ruim.

---

## 2. Pair Programming

**Quando usar:** task ainda nao totalmente clara, decisoes arquiteturais abertas, necessidade de levantar hipoteses e opcoes. Voce e a IA decidem juntos.

**Papel humano:** lidera decisoes, a IA executa e sugere. Dialogo continuo — um nao lidera, constroem juntos.

**Pipeline:**
\`\`\`
start-task → task-plan → [discussao e refinamento conjunto] → implementacao iterativa → regression-check → task-done → ship
\`\`\`

**Quando migrar para AI-driven:** quando o objetivo ficar claro e a spec puder ser escrita. A partir dai, delegar a execucao.

---

## 3. AI como Assistente

**Quando usar:** spike, exploracao, investigacao de bug, decisao de arquitetura ainda aberta. Voce lidera, a IA executa tarefas especificas que voce delega.

**Papel humano:** define o que fazer, quando fazer e como avaliar. IA e uma ferramenta de apoio.

**Pipeline:**
\`\`\`
start-task → [voce define etapas] → IA executa passo a passo → task-done
\`\`\`

**Casos tipicos:**
- "Leia esses 3 arquivos e me explique como esse fluxo funciona"
- "Gere opcoes de abordagem para esse problema"
- "Implemente apenas esse step, vou revisar antes de continuar"

---

## Como escolher o modelo

\`\`\`
Objetivo claro + task bem definida?     → AI-driven
Objetivo claro, mas arquitetura aberta? → Pair Programming
Objetivo ainda sendo formado?           → AI como Assistente
Spike ou investigacao?                  → AI como Assistente
\`\`\`

Os modelos nao sao exclusivos — uma task pode comecar como Assistente (levantar opcoes), virar Pair (decidir abordagem) e terminar como AI-driven (implementacao com spec).

---

# Fluxo Operacional

## Ciclo de vida de uma task

\`\`\`
ANTES
  1. Criar tarefa              → tasks/tk-XXX-nome.md (template: task.md)
  2. AI le o contexto          → .ai/AGENTS.md → SYSTEM.md → MAP → task → SURFACES

DURANTE
  3. Identificar Code Surface  → arquivos relevantes da task
  4. Executar comandos do Plan → selecionados de .ai/commands/
  5. Se houver trade-off       → knowledge/dec-*.md (template: decision.md)

DEPOIS
  6. Registrar execucao        → runs/YYYY-MM-DD-nome.md (template: run.md)
  7. Finalizar tarefa          → mover para tasks/done/
  8. Se mudanca estrutural     → kernel-check (verificar .ai/)
  9. Se algo quebrou           → knowledge/inv-*.md (template: investigation.md)

SOB DEMANDA (usuario pede)
  10. Revisar o que foi feito  → knowledge/rev-*.md (template: review.md)
\`\`\`

## Quando cada artefato nasce

| Momento | Artefato | Obrigatorio? |
|---|---|---|
| Antes de codar | Task | Sim |
| Durante, ao escolher entre opcoes | Decision | Quando houver trade-off |
| Ao finalizar a task | Run | Sim |
| Quando algo quebra | Investigation | Quando houver bug/problema |
| Quando o usuario quiser estudar | Review | Sob demanda |

---

# Manutencao do Context Kernel

Os arquivos do kernel devem permanecer curtos, claros e atualizados.
Quando crescem demais, deixam de ser mapas e viram documentacao pesada — reduzindo eficiencia e aumentando custo de tokens.

## Limites recomendados

| Arquivo | Limite |
|---|---|
| `AGENTS.md` | 200 linhas |
| `SYSTEM.md` | 150-200 linhas |
| `CODEBASE_MAP.md` | 10-15 modulos (~200 linhas) |
| `CONTEXT_SURFACES.md` | Apenas superficies criticas (~150 linhas) |
| **Total do kernel** | **~600 linhas / ~8.000 tokens** |

Se um arquivo ultrapassar o limite, a solucao e extrair detalhes para `docs/` — nao expandir o kernel.

\`\`\`
SYSTEM.md             ← resumo da arquitetura (kernel)
docs/architecture/    ← detalhes extraidos
  auth-architecture.md
  billing-architecture.md
\`\`\`

## Quando compactar

Compactar so vale quando ha problema real — nao por precaucao.

| Gatilho | Acao |
|---|---|
| Arquivo ultrapassa **75% do limite** | Revisar e remover redundancias |
| Arquivo ultrapassa **90% do limite** | Extrair detalhes para `docs/` |
| Total do kernel ultrapassa **~600 linhas** | Avaliar splitting por dominio |
| AI comeca a errar localizacao de codigo | Revisar `CODEBASE_MAP.md` primeiro |
| Respostas da AI ficam lentas ou genericas | Verificar tamanho total do contexto carregado |

## Risco de fragmentacao excessiva

Criar muitos arquivos de contexto pode **piorar** o raciocinio da AI — nao melhorar.

Quando o contexto esta muito fragmentado, o agente precisa:
1. descobrir quais arquivos existem
2. decidir quais carregar
3. combinar mentalmente regras espalhadas

Isso aumenta a chance de ignorar regras, interpretar errado e gerar decisoes inconsistentes.

**Sinais de fragmentacao excessiva:**
- `.ai/` com mais de 10 arquivos de contexto
- Regras similares espalhadas em arquivos diferentes
- AI aplica regras de forma inconsistente entre sessoes

**Solucao:** consolidar regras relacionadas num unico arquivo antes de criar novos.
O kernel ideal tem **poucos arquivos com responsabilidades claras** — nao muitos arquivos pequenos.

## Quando revisar o kernel

Revisar apos qualquer uma dessas mudancas:
- Criacao de novo modulo importante
- Novo endpoint ou fluxo principal
- Mudanca relevante de arquitetura
- Mudanca significativa de dependencias entre modulos

Para revisao, usar o comando `kernel-check` (.ai/commands/kernel-check.md).

---

# Erros Comuns

Erros que aparecem com frequencia ao adotar o modelo — e como evitar.

## Memory/contexto grande demais
Criar muitos arquivos de contexto achando que mais informacao = melhor resultado.
Na pratica, a AI le pouco de cada arquivo e as respostas ficam inconsistentes.
**Correto:** poucos arquivos com responsabilidade clara. Kernel ideal tem 4-6 arquivos.

## Tasks virando documentacao densa
Tasks com dezenas de secoes, muito texto explicativo e contexto redundante.
A AI nao consegue extrair o essencial e o plano fica generico.
**Correto:** task curta e direta — objetivo, restricoes, etapas, criterio de aceite. Se precisar de mais contexto, usar o campo Code Surface com arquivos especificos.

## Misturar contexto dentro de `src/`
Colocar arquivos `.md` de arquitetura ou regras dentro das pastas de codigo.
**Correto:** contexto fica em `.ai/`, documentacao tecnica em `docs/`, codigo em `src/`.

## Criar estrutura antes de ter necessidade
Montar subpastas, indices, wikis e cockpits antes de ter conteudo suficiente.
Gera documentacao morta que a AI carrega sem utilidade.
**Correto:** estrutura emerge do uso. Criar pasta quando houver 5+ itens ou problema real de navegacao.

## Atualizar o kernel raramente
AGENTS.md e CODEBASE_MAP desatualizados fazem a AI trabalhar com mapa errado.
**Correto:** rodar `kernel-check` apos qualquer mudanca estrutural relevante.

---

# Principios

1. **Fonte unica de verdade** — context kernel em .ai/, sem duplicacao
2. **Pontes, nao copias** — cada AI recebe um ponteiro, nao uma copia
3. **Estrutura emerge do uso** — subpastas sao criadas quando necessario
4. **Documentacao enxuta** — cada arquivo tem funcao clara e unica
5. **Separacao de camadas** — kernel (o que sei) vs workspace (o que faco) vs bridges (quem le)
6. **Menos automacao, mais contexto** — IA forte + documentacao clara + workflow simples

## Quando a AI erra, onde mexer primeiro
\`\`\`
1. Melhorar CODEBASE_MAP.md    ← 80% dos problemas sao "AI nao achou o codigo certo"
2. Melhorar AGENTS.md          ← AI nao seguiu as regras
3. Melhorar a task              ← contexto, escopo ou Code Surface insuficiente
\`\`\`
Antes de criar agentes, pipelines ou automacoes complexas, resolver nessa ordem.

---

# Checklist de Avaliacao (projeto existente)

Use para auditar se o workspace de um projeto esta saudavel.

## Context Kernel
- [ ] `.ai/` existe com os 4 arquivos principais?
- [ ] AGENTS.md tem ordem de leitura definida?
- [ ] CODEBASE_MAP.md organizado por modulos funcionais (nao por pastas)?
- [ ] CODEBASE_MAP.md tem Critical Paths?
- [ ] CONTEXT_SURFACES.md tem risk levels definidos?
- [ ] Nenhum arquivo do kernel passou dos limites recomendados?

## AI Bridges
- [ ] Existe pelo menos uma ponte para cada ferramenta de AI usada no projeto?
- [ ] As pontes apontam para `.ai/` sem duplicar conteudo?

## Workspace Operacional
- [ ] `.aiws/` existe com as pastas base?
- [ ] Os 7 templates estao em `.aiws/templates/`?
- [ ] Os templates estao referenciados no AGENTS.md?
- [ ] Os comandos em `.ai/commands/` refletem o workflow atual?

## docs/
- [ ] `docs/README.md` existe e esta atualizado?
- [ ] Existe ao menos um ADR para cada decisao arquitetural importante?

## Sinais de alerta
- AI explora muitos arquivos antes de responder → CODEBASE_MAP insuficiente
- AI ignora convencoes do projeto → AGENTS.md fraco ou nao carregado
- Tasks sem Code Surface definido → templates nao sendo usados
- Knowledge/ vazio apos muitas tasks → regra de decisao nao sendo aplicada
- Kernel com mais de 600 linhas → hora de compactar ou fazer splitting

---

# Otimizacoes Futuras

As otimizacoes abaixo nao devem ser aplicadas antes de haver necessidade real.
Criar estrutura especulativa gera documentacao morta, consome tokens e aumenta manutencao.

## Knowledge como Mini-Wiki Tecnico
**O que e:** Reorganizar `knowledge/` com subpastas e um `KNOWLEDGE_INDEX.md` como indice navegavel.
**Quando criar:**
- `knowledge/` tiver 10+ documentos
- Dificil encontrar um doc especifico pelo prefixo
- Time cresceu e precisa de navegacao mais estruturada
**Como ficaria:**
\`\`\`
knowledge/
  KNOWLEDGE_INDEX.md
  investigations/
  concepts/
  patterns/
  decisions/
\`\`\`

## Mapa de Runtime
**O que e:** Descreve como o sistema roda em producao — containers, portas, networking, volumes, deploy.
**Quando criar:**
- Multiplos containers com dependencias entre si
- Ambientes staging/prod com configuracoes diferentes
- Workers, filas ou caches (Redis, RabbitMQ)
- Deploy complexo (Kubernetes, blue-green, canary)
**Onde colocaria:** `.ai/RUNTIME_MAP.md` ou secao no SYSTEM.md

## Mapa de Arquitetura Visual
**O que e:** Diagrama de como os componentes se conectam (pode ser Mermaid ou ASCII).
**Quando criar:**
- Time com mais de 5 desenvolvedores
- Novos membros precisam de onboarding visual
- SYSTEM.md em texto nao e suficiente para explicar o sistema
**Onde colocaria:** Secao no SYSTEM.md (Mermaid renderiza direto no GitHub)

## Mapa de Fluxo Separado
**O que e:** Documento dedicado para fluxos end-to-end (expande os Critical Paths).
**Quando criar:**
- Mais de 10 critical paths no CODEBASE_MAP
- Fluxos complexos com branching condicional
- Integracoes externas (APIs terceiras, webhooks, OAuth multi-provider)
**Onde colocaria:** `.ai/FLOW_MAP.md`

## Splitting do Context Kernel
**O que e:** Dividir arquivos do kernel em partes menores para carregamento seletivo.
**Quando criar:**
- Kernel total ultrapassa ~10.000 tokens
- IAs com janela pequena nao conseguem processar tudo
- Projeto cresce para mais de 20 modulos
**Como faria:** Separar CODEBASE_MAP por dominio (frontend map, backend map) e carregar sob demanda

## CONTRACTS.md — Contratos de API explícitos
**O que e:** Arquivo dedicado para definir contratos que a IA nao pode quebrar: endpoints de API, formatos de request/response, eventos, integracoes entre modulos.
**Quando criar:**
- AI comeca a fazer refactors que quebram silenciosamente APIs ou eventos
- Multiplos modulos dependem de contratos compartilhados
- Backend e frontend evoluem em paralelo com risco de divergencia
**Como ficaria:**
\`\`\`
docs/api-contracts.md    ← faz parte da documentacao
\`\`\`
Ou, se precisar que a AI carregue automaticamente:
\`\`\`
.ai/CONTRACTS.md         ← parte do kernel
\`\`\`
**Diferenca do CONTEXT_SURFACES.md:** CONTRACTS define *o que nao pode mudar* (contrato formal). CONTEXT_SURFACES define *o que pode ser afetado* (impacto de mudanca).

## Cockpit Layer — Paineis operacionais da IA
**O que e:** Pasta `.ai/cockpit/` com visao rapida do estado atual do projeto — modulos, tasks ativas, estado de deploy.
**Quando criar:**
- 3+ tasks em paralelo com desenvolvedores diferentes
- AI precisa saber o que esta em andamento sem listar a pasta de tasks
- Times maiores onde a visao do "agora" muda com frequencia
**Como ficaria:**
\`\`\`
.ai/cockpit/
  project-map.md    ← modulos e localizacao (complementa CODEBASE_MAP)
  task-board.md     ← tasks ativas no momento
\`\`\`
**Nota:** `project-map.md` e `module-map.md` sao cobertos pelo nosso CODEBASE_MAP.md. So o `task-board.md` traria valor adicional real.

## Contexto Modular — .ai/context/
**O que e:** Dividir as regras do AGENTS.md em arquivos especializados por categoria.
**Quando criar:**
- AGENTS.md ultrapassar 300 linhas e ainda assim nao ser possivel compactar
- Projeto com multiplos times que precisam de contextos distintos (frontend, backend, infra)
- AI comeca a ignorar regras por excesso de contexto no mesmo arquivo
**Como ficaria:**
\`\`\`
.ai/context/
  architecture.md     ← regras de arquitetura
  coding-rules.md     ← convencoes de codigo
  testing-rules.md    ← regras de testes
  api-rules.md        ← regras de API e contratos
\`\`\`
AGENTS.md vira orquestrador leve que aponta para os arquivos de contexto.

## ~~Task Capsules~~ — Implementado

Toda task agora usa pasta propria. Ver secao `tasks/` acima para detalhes da estrutura.

## SYSTEM_MAP — Mapa estrutural separado do CODEBASE_MAP
**O que e:** Arquivo dedicado exclusivamente ao mapa estrutural do sistema: modulo → localizacao → responsabilidade. Versao mais enxuta e scanning-friendly do CODEBASE_MAP.
**Quando criar:**
- CODEBASE_MAP ultrapassa o limite recomendado e nao e possivel compactar
- Sistema tem 15+ modulos com responsabilidades distintas
- AI frequentemente confunde modulos ou navega pelo repo antes de responder
**Como ficaria:**
\`\`\`
.ai/SYSTEM_MAP.md    ← parte do kernel, carregado automaticamente
\`\`\`
Conteudo por modulo:
\`\`\`
## [modulo]
Location: src/path/
Responsibility: [descricao curta]
Dependencies: [modulos dos quais depende]
\`\`\`
**Diferenca do CODEBASE_MAP:** SYSTEM_MAP e mais enxuto — sem entry points, tests ou critical paths. So o essencial para a AI localizar e entender cada modulo rapidamente.

## CODE_KNOWLEDGE — Regras de negocio que nao aparecem no codigo
**O que e:** Arquivo que registra conhecimento funcional do sistema: regras de negocio, comportamentos nao obvios, armadilhas tecnicas e decisoes que nao ficam evidentes lendo o codigo.
**Quando criar:**
- Dominio de negocio complexo com muitas regras implícitas
- AI frequentemente viola regras de negocio ao gerar codigo
- Onboarding de novos membros exige explicar "por que" alem do "como"
**Como ficaria:**
\`\`\`
docs/code-knowledge.md    ← documentacao consultada sob demanda
\`\`\`
Ou, se precisar que a AI carregue automaticamente em toda sessao:
\`\`\`
.ai/CODE_KNOWLEDGE.md     ← parte do kernel
\`\`\`
Estrutura por modulo:
\`\`\`
## [Modulo]
Regra: [descricao]
Localizacao: src/path/arquivo.ts
Metodos relevantes: [lista]
Notas: [contexto adicional, armadilhas]
\`\`\`
**Diferenca do CONTRACTS.md:** CONTRACTS define interfaces/assinaturas que nao podem mudar. CODE_KNOWLEDGE registra regras de negocio e comportamentos — e mais amplo e orientado ao dominio.

## Capability Layer — Funcionalidades do produto para AI
**O que e:** Pasta `capabilities/` com um arquivo por funcionalidade principal do produto, descrevendo proposito, atores, operacoes e regras criticas. Faz a AI pensar em termos de *o que o sistema faz* em vez de *como o codigo esta organizado*.
**Quando criar:**
- SYSTEM.md nao consegue mais descrever adequadamente o produto
- AI frequentemente planeja mudancas sem entender o contexto do negocio
- Produto com 10+ features distintas com regras proprias
- Time de produto e time tecnico usam vocabulario diferente
**Como ficaria:**
\`\`\`
capabilities/
  billing.md
  auth.md
  reports.md
  budget.md
\`\`\`
Estrutura de cada arquivo:
\`\`\`
## Capability: [nome]
Purpose: [o que essa funcionalidade entrega ao usuario]
Actors: [quem usa]
Core operations: [lista de operacoes principais]
Backend location: src/...
Frontend location: src/...
Important rules: [regras criticas]
Related modules: [modulos envolvidos]
\`\`\`
**Diferenca do SYSTEM.md:** SYSTEM.md descreve arquitetura tecnica. Capabilities descrevem funcionalidades do produto — o vocabulario do negocio.

## Regra geral
Antes de criar qualquer otimizacao, perguntar:
1. O kernel atual esta causando problemas reais? (respostas ruins, tokens estourados)
2. A AI esta errando por falta de contexto ou por excesso?
3. Existe uma forma de resolver sem adicionar mais arquivos?

Se as 3 respostas forem "nao", nao otimize.

---

# Resultado Esperado

Quando usado corretamente, o AI Engineering Workspace permite:
- Onboarding rapido de novos engenheiros e agentes de AI
- Colaboracao eficiente com multiplas IAs (Claude, Copilot, Cursor, Codex)
- Menor exploracao desnecessaria do codigo
- Maior seguranca em mudancas
- Historico tecnico rastreavel
- Zero duplicacao de contexto entre ferramentas
