Sim. Usar **`.workspace` como memória pessoal da IA** é uma prática muito poderosa. A ideia é manter **conhecimento útil para você e para a IA**, mas que **não precisa ir para o git**.
Isso funciona muito bem com:
- Claude Code
- Cursor
- GitHub Copilot
Porque esses editores podem ler arquivos locais e usar como contexto.
---
# Objetivo da `.workspace`
Separar duas coisas:
**Repo (git)**
- arquitetura oficial
- código
- tasks
- decisões
**Workspace (local)**
- memória pessoal
- experimentos
- análises
- notas da IA
---
# Estrutura recomendada
```text
.workspace/
memory/
  insights.md
  patterns.md
  pitfalls.md
analysis/
  system-review.md
  architecture-notes.md
tasks/
  current-task.md
  scratch-plan.md
experiments/
  prototype-notes.md
```
---
# 1. memory
Conhecimento acumulado.
```
.workspace/memory/
```
Exemplo:
```
patterns.md
```
```text
Observed Patterns
Billing module uses service-layer pattern.
Avoid modifying couponCalculator without updating billingService tests.
```
---
# 2. analysis
Análises feitas pela IA.
```
.workspace/analysis/
```
Exemplo:
```
system-review.md
```
```text
Architecture Observations
Billing module is tightly coupled with invoice generation.
Potential refactor candidate.
```
---
# 3. tasks
Notas de trabalho temporárias.
```
.workspace/tasks/
```
Exemplo:
```
current-task.md
```
```text
Current Task
BE-004
Fix coupon stacking logic.
Modules involved
billingService
couponCalculator
```
---
# 4. experiments
Ideias e protótipos.
```
.workspace/experiments/
```
Exemplo:
```
prototype-notes.md
```
```text
Idea
Move coupon logic to separate pricing module.
```
---
# Estrutura completa recomendada
```text
repo/
AGENTS.md
SYSTEM_MAP.md
ARCHITECTURE.md
PROJECT_MAP.md
ENTRYPOINTS.md
.ai/
  context/
  commands/
docs/
  decisions/
  guidelines/
engineering/
  backend/tasks/
  frontend/tasks/
  automation/tasks/
src/
.workspace/
  memory/
  analysis/
  tasks/
  experiments/
```
---
# Vantagem dessa separação
Repo fica:
- limpo
- versionado
- estável
Workspace fica:
- pessoal
- experimental
- descartável
---
# Como a IA usa isso
Fluxo comum:
1. IA lê **repo context**
2. IA lê **task capsule**
3. IA consulta **workspace notes**
Isso melhora muito a continuidade do trabalho.
---
# Regra simples
Coloque no **repo**:
- conhecimento que o time precisa
Coloque no **workspace**:
- conhecimento que **só você precisa**
---
Se quiser, posso também te mostrar **uma pequena melhoria nessa arquitetura que reduz drasticamente a confusão da IA em projetos grandes**:
um arquivo chamado **AI_ENTRYPOINT.md** que vira o verdadeiro ponto inicial para qualquer agente que entrar no repo.