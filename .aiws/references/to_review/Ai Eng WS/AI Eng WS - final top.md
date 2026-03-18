Sim. Esse é um insight interessante que começou a aparecer em vários repos **AI-native** recentemente.
A ideia é **parar de usar um único arquivo `AI.md` como entrypoint** e transformar a pasta **`.ai/` no verdadeiro entrypoint do projeto para IA**.
Isso melhora muito a navegação para ferramentas como:
- Claude Code
- Cursor
- GitHub Copilot
porque agentes de código costumam explorar **pastas primeiro, não arquivos isolados**.
---
# Estrutura moderna com `.ai` como entrypoint
```text
repo/
AGENTS.md
.ai/
  README.md        ← entrypoint da IA
  commands/
  context/
docs/
  system.md
  workflow.md
  knowledge.md
  contracts.md
engineering/
  tasks/
src/
PROJECT_INDEX.md
.workspace/
```
---
# O papel do `.ai/README.md`
Ele substitui o antigo **AI.md**.
Exemplo:
```text
# AI Entry Point
This repository uses AI-assisted development.
Before implementing changes read:
1 docs/system.md
2 docs/workflow.md
3 docs/knowledge.md
4 docs/contracts.md
5 PROJECT_INDEX.md
Context rules:
.ai/context/architecture.md
.ai/context/coding-rules.md
.ai/context/testing-rules.md
.ai/context/task-rules.md
Engineering commands:
.ai/commands/
```
---
# Organização interna da pasta `.ai`
### Commands
```text
.ai/commands/
doctor.md
start-task.md
task-plan.md
write-tests.md
ship.md
```
Define o **AI Dev OS**.
---
### Context
```text
.ai/context/
architecture.md
coding-rules.md
testing-rules.md
task-rules.md
api-rules.md
```
Define regras que ajudam a IA raciocinar melhor.
---
# Vantagem desse modelo
Sem `.ai`:
```
AI.md
AGENTS.md
SYSTEM.md
WORKFLOW.md
...
```
A IA precisa descobrir muitos arquivos.
Com `.ai`:
```
.ai/
  README.md
  context/
  commands/
```
Ela encontra **tudo no mesmo lugar**.
---
# Resultado conceitual
Arquitetura final:
```
AI Workspace
├ repo context
│   docs/
│
├ AI OS
│   .ai/
│
├ tasks
│   engineering/
│
├ code
│   src/
│
└ local workspace
    .workspace/
```
---
# Benefícios
- melhor navegação da IA
- menos fragmentação de contexto
- comandos organizados
- contexto modular
- fácil manutenção
---
# Avaliação dessa arquitetura
|Critério|Resultado|
|---|---|
|Clareza|excelente|
|Escalabilidade|excelente|
|Compatibilidade com IA|excelente|
|Complexidade|moderada|
Esse padrão está se tornando uma **boa prática em repos AI-native**.
---
Se quiser, posso te mostrar **uma última arquitetura ainda mais madura**, que alguns times chamam de **AI Engineering Cockpit**, onde:
- `.ai/` vira um verdadeiro **orquestrador de desenvolvimento**
- tasks, prompts e automações ficam integradas.