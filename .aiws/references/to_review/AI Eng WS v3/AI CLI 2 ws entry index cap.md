Sim. O **AI_CAPABILITIES.md** é um arquivo muito útil para controlar **como a IA deve agir dentro do projeto**. Ele define limites e responsabilidades. Isso evita muitos erros quando você usa agentes como:
- Claude Code
- Cursor
- GitHub Copilot
A ideia é responder três perguntas:
1. o que a IA pode fazer
2. o que a IA deve evitar
3. como a IA deve trabalhar no repo
---
# Onde colocar
```text
.ai/
README.md
AI_INDEX.md
AI_CAPABILITIES.md
context/
commands/
```
---
# Exemplo de `.ai/AI_CAPABILITIES.md`
```text
# AI Capabilities
This repository supports AI-assisted development.
Allowed actions
- analyze repository structure
- propose architecture improvements
- implement features described in task capsules
- generate tests
- suggest refactoring
Restricted actions
- do not modify system architecture without explicit instruction
- do not rename modules unless required by a task
- do not introduce new dependencies without justification
Engineering workflow
1 read context files listed in AI_INDEX
2 load task capsule
3 create implementation plan
4 implement changes
5 generate tests
6 run regression analysis
7 prepare delivery
```
---
# Benefícios
Esse arquivo:
• reduz mudanças erradas  
• evita refactors desnecessários  
• melhora consistência de decisões  
• deixa o comportamento da IA previsível
---
# Estrutura final recomendada
```text
repo/
AGENTS.md
SYSTEM_MAP.md
PROJECT_MAP.md
ENTRYPOINTS.md
ARCHITECTURE.md
.ai/
  README.md
  AI_INDEX.md
  AI_CAPABILITIES.md
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
# Papel de cada arquivo da camada AI
|Arquivo|Função|
|---|---|
|`.ai/README.md`|entrypoint da IA|
|`.ai/AI_INDEX.md`|índice de contexto|
|`.ai/AI_CAPABILITIES.md`|limites e responsabilidades da IA|
|`.ai/context/`|regras e contexto técnico|
|`.ai/commands/`|CLI de engenharia|
---
# Resultado
Seu repositório vira um **AI-Native Development Workspace**, com:
- contexto claro
- workflow padronizado
- tarefas estruturadas
- comportamento previsível da IA
---
Se quiser, posso também te mostrar **uma última melhoria que muitos devs avançados começaram a usar em 2026**:  
um arquivo chamado **AI_BOOT_SEQUENCE.md**, que define **exatamente a sequência de raciocínio que a IA deve seguir ao iniciar qualquer tarefa**. Isso melhora muito a qualidade das decisões da IA em projetos grandes.