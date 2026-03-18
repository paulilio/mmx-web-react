O ponto onde muitas equipes percebem queda de performance da IA é quando **a raiz do repo tem arquivos demais de contexto**.
Mesmo que sejam bons documentos, a IA precisa:
- descobrir quais arquivos existem
- decidir quais ler
- gastar tokens analisando todos
A solução que vários times adotaram é **uma única porta de entrada para todo o contexto**.
---
# Ajuste importante na raiz
Em vez de vários arquivos na raiz:
```
AI_CONTEXT.md
SYSTEM.md
WORKFLOW.md
KNOWLEDGE.md
CONTRACTS.md
PROJECT_INDEX.md
```
Você deixa **apenas um arquivo principal**.
```
AI.md
```
---
# Estrutura otimizada
```
repo/
AI.md
docs/
  system.md
  workflow.md
  knowledge.md
  contracts.md
engineering/
  tasks/
src/
.ai/
  commands/
.workspace/
```
---
# O papel do AI.md
Ele vira **a porta de entrada universal da IA**.
Exemplo:
```
# AI Entry Point
This repository uses AI-assisted development.
Before making changes read the following files in order.
1 docs/system.md
2 docs/workflow.md
3 docs/knowledge.md
4 docs/contracts.md
5 PROJECT_INDEX.md
Tasks are located in:
engineering/tasks/
Each task contains:
task.md
plan.md
review.md
AI commands are located in:
.ai/commands/
```
---
# Por que isso melhora muito
Sem AI.md
IA precisa descobrir:
- AI_CONTEXT
- SYSTEM
- WORKFLOW
- KNOWLEDGE
- CONTRACTS
Com AI.md
IA precisa ler apenas:
```
AI.md
```
E já descobre tudo.
---
# Resultado prático
Repos grandes (milhares de arquivos):
|Estrutura|Tempo de entendimento|
|---|---|
|Arquivos espalhados|maior|
|AI.md como hub|muito menor|
Isso melhora bastante o comportamento em ferramentas como:
- Claude Code
- Cursor
- GitHub Copilot
---
# Arquitetura final recomendada
```
repo/
AI.md                ← único entrypoint de IA
docs/
  system.md
  workflow.md
  knowledge.md
  contracts.md
engineering/
  tasks/
src/
PROJECT_INDEX.md
.ai/
  commands/
.workspace/
```
---
# Camadas conceituais
Mesmo simplificado, você ainda mantém:
|Conceito|Onde está|
|---|---|
|Context-Driven Dev|AI.md + docs/system|
|Task-Driven Dev|engineering/tasks|
|Project Memory Layer|docs/knowledge|
|Contract Layer|docs/contracts|
|AI Dev OS|.ai/commands|
---
# Avaliação
|Critério|Resultado|
|---|---|
|Complexidade|baixa|
|Escalabilidade|alta|
|Manutenção|simples|
|Performance IA|excelente|
Essa estrutura é uma das mais equilibradas hoje para **repos AI-native**.
---
Se quiser, posso também te mostrar algo que **pouquíssimos devs perceberam ainda**, mas que muda muito o uso com IA:
**como fazer a IA entender automaticamente o projeto inteiro sem você precisar mandar “read AI.md” toda vez.** Isso reduz muito fricção no dia a dia.