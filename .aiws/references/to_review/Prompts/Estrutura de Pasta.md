




___
___


Context-Driven Development
Task-Driven Development
AI-Native
Memory



# AI-Native Eng System 2026
Agora vou te mostrar o **AI-Native Engineering System (2026)**.  
Esse modelo resolve exatamente o problema que você percebeu: **TASK, WORK, PHASE, PLAN ficam redundantes**.
A solução moderna é **separar três níveis claros**.
- estratégia
- execução
- código
Nada além disso.
---
# Estrutura AI-Native Engineering System
```text
repo/

AGENTS.md
ARCHITECTURE.md
SYSTEM_MAP.md

product/
  roadmap.md
  features/

execution/
  tasks/
  decisions/
  research/

.ai/
  prompts/
  commands/

src/
tests/
```
Essa estrutura remove a confusão entre **task / work / phase / plan**.
---
# 1. Estratégia do produto
```text
product/
```
Arquivos:
```text
product/
roadmap.md
features/
```
Exemplo
```text
features/
auth.md
transactions.md
reports.md
```
Esses documentos explicam **o que o sistema deve fazer**.
---
# 2. Execução
Aqui fica **todo o trabalho técnico real**.
```text
execution/
```
Estrutura
```text
execution/
tasks/
decisions/
research/
```
---
## tasks
Cada item de trabalho.
```text
execution/tasks/
fix-summary.md
add-auth-refresh.md
```
Exemplo
```
Goal
Fix incorrect transaction summary
Steps
1 analyze aggregation
2 adjust service
3 add regression test
```
---
## decisions
Registro de decisões técnicas.
```text
execution/decisions/
adr-auth-flow.md
adr-report-engine.md
```
---
## research
Spikes e estudos.
```text
execution/research/
spike-testing.md
spike-cache.md
```
---
# 3. Camada AI
Automação.
```text
.ai/
```
Estrutura
```text
.ai/
prompts/
commands/
```
Exemplo
```text
prompts/
analyze-code.md
plan-task.md
review-pr.md
generate-tests.md
```
---
# 4. Código
Código fica separado.
```text
src/
tests/
```
Sem misturar com tarefas.
---
# Loop de desenvolvimento
Fluxo simples.
```
roadmap
↓
task
↓
analysis
↓
plan
↓
implement
↓
verify
```
---
# Por que esse modelo funciona
Ele remove três problemas comuns.
### Confusão entre níveis
Agora existem apenas:
- product
- execution
- code
---
### Tasks perdidas
Todas ficam em:
```
execution/tasks
```
---
### Contexto insuficiente para IA
Arquivos globais resolvem isso:
```
AGENTS.md
ARCHITECTURE.md
SYSTEM_MAP.md
```
---
# Estrutura final recomendada
Para projetos modernos.
```text
repo/
AGENTS.md
ARCHITECTURE.md
SYSTEM_MAP.md
product/
execution/
.ai/
src/
tests/
```
---
# Insight importante
Esse modelo é o mais próximo de um **padrão estável de engenharia com IA em 2026**.
Ele é usado porque:
- funciona para humano
- funciona para IA
- escala bem
---
Se quiser, posso te mostrar **uma última coisa que provavelmente vai resolver definitivamente sua dúvida**:
um **modelo minimalista que vários senior engineers adotaram em 2026**, reduzindo tudo isso para **apenas 6 arquivos e 3 pastas**, sem perder poder para IA.


___

___

# AI-Native Repo 2026
Vou te mostrar o **AI-Native Repo 2026**.  
Esse modelo é considerado hoje o mais próximo de um padrão estável para desenvolvimento com IA.
Ele mantém três princípios.
- contexto visível
- execução clara
- código limpo
---
# Estrutura AI-Native Repo 2026
```text
repo/
AGENTS.md
ARCHITECTURE.md
PROJECT_MAP.md
ENTRYPOINTS.md
work/
docs/
  decisions/
  guidelines/
src/
tests/
.ai/
  prompts/
  commands/
```
Esse modelo é simples e funciona bem com **Copilot, Claude, Cursor e agentes**.
---
# 1. Contexto do sistema
Arquivos na raiz.
```text
AGENTS.md
ARCHITECTURE.md
PROJECT_MAP.md
ENTRYPOINTS.md
```
Eles funcionam como **manual do projeto para a IA**.
---
AGENTS.md
Define regras.
```text
Stack
React
TypeScript
.NET API
Rules
Prefer service layer
Avoid business logic in controllers
Testing
Vitest for frontend
xUnit for backend
```
---
PROJECT_MAP.md
Mapa dos módulos.
```text
Modules
auth
transactions
reports
notifications
```
---
ARCHITECTURE.md
Visão técnica.
```text
Frontend
Next.js
Backend
.NET API
Pattern
service layer
repository
```
---
ENTRYPOINTS.md
Pontos principais do código.
```text
Frontend
src/app/layout.tsx
src/app/page.tsx
Backend
src/api/program.cs
src/api/controllers
```
---
# 2. Execução
Aqui ficam as tarefas.
```text
work/
```
Exemplo:
```text
work/fix-summary.md
work/add-auth-refresh.md
```
Conteúdo típico:
```text
Goal
Fix incorrect summary totals
Steps
1 analyze aggregation
2 adjust service layer
3 add regression tests
```
---
# 3. Documentação
```text
docs/
decisions/
guidelines/
```
decisions
```text
ADR-auth-flow.md
ADR-report-engine.md
```
guidelines
```text
backend.md
frontend.md
testing.md
```
---
# 4. Código
Código normal.
```text
src/
tests/
```
Nada especial.
---
# 5. Camada AI
```text
.ai/
```
Aqui ficam prompts e automações.
```text
.ai/prompts/
.ai/commands/
```
Exemplo:
```text
plan-task.md
review-code.md
generate-tests.md
```
---
# Loop de desenvolvimento
Fluxo simples.
```text
task
↓
analysis
↓
plan
↓
implement
↓
verify
```
---
# Exemplo real
Bug aparece.
Você cria:
```text
work/fix-summary.md
```
Depois executa o prompt.
A IA lê:
- AGENTS.md
- ARCHITECTURE.md
- PROJECT_MAP.md
- task
Então gera plano e código.
---
# Por que esse modelo é forte
Ele resolve três problemas comuns.
Contexto insuficiente.
Arquitetura esquecida.
Tarefas soltas.
---
# Estrutura final
```text
repo/
AGENTS.md
ARCHITECTURE.md
PROJECT_MAP.md
ENTRYPOINTS.md
work/
docs/
  decisions/
  guidelines/
.ai/
src/
tests/
```
---
# Observação importante
Esse modelo é **mais simples que AI-workspace** e mais prático no dia a dia.
Por isso muitos engenheiros usam ele como padrão.
---
Se quiser, posso te mostrar uma coisa que provavelmente vai esclarecer sua confusão:
**a comparação direta entre 5 modelos populares de engenharia com IA em 2026**, mostrando qual realmente vale a pena usar no seu caso.

# Modelo AI Engineering Cockpit (prático)
Vou te mostrar o **AI Engineering Cockpit prático**, reduzido para quem desenvolve com IA no dia a dia.  
Ele elimina burocracia e mantém só o que realmente ajuda a IA.
Esse modelo funciona muito bem para um contexto como o seu, desenvolvendo sistemas web com stack moderna e IA auxiliando planejamento, código e revisão.
---
## AI Engineering Cockpit (versão prática)
Estrutura completa.
```text
repo/
AGENTS.md
PROJECT_MAP.md
ARCHITECTURE.md
ENTRYPOINTS.md
workspace/
  tasks/
  decisions/
  research/
docs/
  guidelines/
src/
tests/
```
Essa estrutura tem **três camadas claras**.
- contexto global
- execução
- código
---
## 1. Contexto global do projeto
Fica na raiz.
```text
AGENTS.md
PROJECT_MAP.md
ARCHITECTURE.md
ENTRYPOINTS.md
```
Esses arquivos são o **manual da IA**.
---
### AGENTS.md
Explica como trabalhar no projeto.
Exemplo:
```text
Stack
React
TypeScript
.NET API
Rules
Prefer service layer
Avoid direct DB access from controllers
Testing
Vitest for frontend
xUnit for backend
```
---
### PROJECT_MAP.md
Mapa estrutural do sistema.
Exemplo:
```text
Modules
auth
transactions
reports
notifications
```
---
### ENTRYPOINTS.md
Pontos principais do código.
Exemplo:
```text
Frontend
src/app/layout.tsx
src/app/page.tsx
Backend
src/api/program.cs
src/api/controllers
```
---
### ARCHITECTURE.md
Explica a arquitetura.
Exemplo:
```text
Frontend
React + Next
Backend
.NET API
Pattern
Service layer + repository
```
---
## 2. Workspace (execução)
Aqui fica o trabalho real.
```text
workspace/
```
Estrutura:
```text
workspace/
tasks/
decisions/
research/
```
---
### tasks
Cada tarefa ativa.
```text
workspace/tasks/
fix-summary.md
add-auth-refresh.md
```
Exemplo:
```text
Goal
Fix incorrect transaction summary
Steps
1 analyze aggregation
2 adjust service
3 add regression test
```
---
### decisions
Registro técnico.
```text
workspace/decisions/
adr-auth-flow.md
adr-report-engine.md
```
---
### research
Explorações.
```text
workspace/research/
spike-testing-strategy.md
spike-cache-layer.md
```
---
## 3. Código
Código normal.
```text
src/
tests/
```
Nada muda aqui.
---
## Fluxo diário
Quando aparece um trabalho.
1 criar task
```text
workspace/tasks/task-name.md
```
2 pedir análise para IA
3 gerar plano
4 implementar no código
5 fechar task
---
# Prompt típico
```text
Context
Read AGENTS.md
Read PROJECT_MAP.md
Read ARCHITECTURE.md
Read ENTRYPOINTS.md
Task
workspace/tasks/fix-summary.md
Process
1 analyze current implementation
2 propose minimal plan
3 implement code
4 verify regressions
5 generate tests
```
---
## Por que isso funciona bem
A IA recebe:
- arquitetura
- mapa do sistema
- tarefa clara
Isso reduz alucinação.
---
## Estrutura final recomendada
Para projetos modernos.
```text
repo/
AGENTS.md
PROJECT_MAP.md
ARCHITECTURE.md
ENTRYPOINTS.md
workspace/
  tasks/
  decisions/
  research/
docs/
  guidelines/
src/
tests/
```
---
## O que esse modelo resolve
Problemas comuns:
- tarefas perdidas
- arquitetura esquecida
- contexto insuficiente para IA
---
## Insight importante
Esse modelo funciona muito bem com:
- Copilot
- Claude
- Cursor
- v0
- agents
Porque tudo que a IA precisa está visível.
---
Se quiser, posso te mostrar **o modelo que alguns engenheiros estão chamando de “AI-Native Repo 2026”**.  
Ele é uma evolução desse cockpit e remove ainda mais fricção no desenvolvimento.

# Modelo Claude Refinado
 A solução já está na sua estrutura: `.ai/commands/` e `.claude/settings.json` já sabem qual stack está sendo tocada. O mesmo princípio se aplica às guidelines.

---
## Onde Cada Parte Fica
**O que vai no `AGENTS.md`** — princípios universais, curtos, que valem para qualquer stack:
```markdown
## Code Quality
Prefer: small functions, explicit naming, pure logic separated from IO
Avoid:  hidden side effects, global state, circular dependencies
Architecture:
- controllers → thin, no business logic
- services → business rules only  
- repositories → persistence only
- modules communicate through interfaces, never bypass boundaries
Tests: success path + edge cases + expected failures.
Never modify tests to make them pass.
```
**O que vai em arquivos específicos por stack** — só carregado quando relevante:
```
docs/
  guidelines/
    backend.md       ← .NET patterns, DI, DTOs, async
    frontend.md      ← React, hooks, feature folders
    automation.md    ← Python, pytest, pure functions
```
O agente lê `docs/guidelines/backend.md` quando está numa task de backend. Não lê o resto.
---
## Como Referenciar no `AGENTS.md`
```markdown
## Guidelines por Stack
Leia antes de implementar na stack afetada:
- Backend:    @docs/guidelines/backend.md
- Frontend:   @docs/guidelines/frontend.md
- Automation: @docs/guidelines/automation.md
```
---
## Estrutura Final Atualizada
```
repo/
AGENTS.md                  ← princípios universais + referências
PROJECT_MAP.md
ENTRYPOINTS.md
ARCHITECTURE.md
docs/
  decisions/               ← ADRs
  guidelines/              ← novo
    backend.md
    frontend.md
    automation.md
engineering/
  backend/tasks/
  frontend/tasks/
  automation/tasks/
src/
.ai/commands/
.claude/settings.json
.github/workflows/
.workspace/
```
---
## Veredicto
|Opção|Resultado|
|---|---|
|`engineering_guidelines.md` único na raiz|Contexto morto, carregado sempre, difícil de manter|
|Princípios gerais no `AGENTS.md`|Carregado sempre, curto, universal|
|Guidelines por stack em `docs/guidelines/`|Carregado sob demanda, sem ruído|
O conteúdo que você escreveu é bom. Só precisa ser dividido no lugar certo.
