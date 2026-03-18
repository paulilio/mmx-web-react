Sim. Você percebeu exatamente o ponto certo. 👍
Na arquitetura mais madura, **o papel do `AI_ENTRYPOINT.md` é justamente feito pelo `.ai/README.md`**.
Ou seja, **não vale a pena criar os dois**. Isso só duplica contexto e confunde a IA.
A melhor prática hoje é:
```
.ai/
  README.md        ← entrypoint da IA
  context/
  commands/
```
---
# Papel do `.ai/README.md`
Ele é o **primeiro arquivo que qualquer agente deve ler**.
Ele explica:
1. como entender o projeto
2. onde está o contexto
3. como executar tarefas
4. quais comandos usar
---
# Exemplo ideal de `.ai/README.md`
```text
# AI Workspace Entry Point
This repository uses an AI-assisted development workflow.
Before implementing changes follow this order.
1. Read project overview
   AGENTS.md
   SYSTEM_MAP.md
   ARCHITECTURE.md
2. Understand modules
   PROJECT_MAP.md
3. Read engineering rules
   .ai/context/
4. Execute tasks using commands
   .ai/commands/
5. Tasks are located in
   engineering/*/tasks/
```
---
# Estrutura final recomendada
```
repo/
AGENTS.md
SYSTEM_MAP.md
PROJECT_MAP.md
ENTRYPOINTS.md
ARCHITECTURE.md
.ai/
  README.md
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
# Regra simples
Use:
`.ai/README.md` → **entrada da IA**
Não use:
```
AI.md
AI_ENTRYPOINT.md
README_AI.md
```
Isso evita fragmentação.
---
# Insight importante
Muitos projetos AI-native em 2026 seguem este padrão mental:
```
Human entrypoint
README.md
AI entrypoint
.ai/README.md
```
Isso separa **documentação humana** de **documentação para agentes**.
---
Se quiser, posso te mostrar também **uma pequena melhoria que faz Claude e Cursor entenderem o repo muito mais rápido**:
usar um **arquivo `AI_INDEX.md` que lista exatamente quais arquivos a IA deve carregar no contexto**. Isso reduz bastante erros de raciocínio.