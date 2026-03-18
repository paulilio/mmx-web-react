Sim. O **AI_INDEX.md** é um pequeno truque que melhora muito o comportamento da IA. Ele funciona como **um índice de carregamento de contexto**.
Em vez do agente tentar adivinhar quais arquivos são importantes, você **lista explicitamente**.
Isso ajuda bastante ferramentas como:
- Claude Code
- Cursor
- GitHub Copilot
---
# Onde colocar
O melhor lugar é dentro da pasta `.ai`.
```
.ai/
  README.md
  AI_INDEX.md
  context/
  commands/
```
---
# Papel do AI_INDEX
Ele responde apenas uma pergunta:
**quais arquivos a IA deve carregar primeiro para entender o projeto**
---
# Exemplo de `.ai/AI_INDEX.md`
```text
# AI Context Index
When working in this repository load context in the following order.
Core project context
AGENTS.md
SYSTEM_MAP.md
ARCHITECTURE.md
PROJECT_MAP.md
ENTRYPOINTS.md
Engineering rules
.ai/context/system.md
.ai/context/coding-rules.md
.ai/context/testing-rules.md
Task workflow
engineering/*/tasks/
AI commands
.ai/commands/
```
---
# Benefício real
Sem AI_INDEX:
IA precisa:
- explorar repo
- tentar deduzir contexto
Com AI_INDEX:
IA sabe exatamente:
```
load these files first
```
Isso melhora:
- qualidade das respostas
- planejamento de código
- navegação no projeto
---
# Estrutura final ideal
```
repo/
AGENTS.md
SYSTEM_MAP.md
ARCHITECTURE.md
PROJECT_MAP.md
ENTRYPOINTS.md
.ai/
  README.md
  AI_INDEX.md
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
```
---
# Fluxo real da IA nesse modelo
```
.ai/README.md
        ↓
.ai/AI_INDEX.md
        ↓
Project Context
        ↓
Context Capsules
        ↓
Tasks
        ↓
Commands
```
Isso cria **um pipeline claro de entendimento do projeto**.
---
💡 Um último insight importante para esse tipo de arquitetura:
muitos devs estão começando a adicionar um arquivo chamado **AI_CAPABILITIES.md**, onde você descreve **o que a IA pode ou não fazer dentro do repo**.  
Isso reduz bastante erros em tarefas complexas.