Existe um modelo ainda mais radical que alguns times começaram a usar em 2026. Ele é chamado informalmente de **AI Superprompt Architecture**. A ideia é **colocar quase toda a lógica de comportamento da IA em um único arquivo mestre**.
Funciona bem em ambientes como:
- Claude Code
- Cursor
- GitHub Copilot
A motivação é simples. Em vez de espalhar regras em muitos arquivos, você dá ao agente **um único documento completo que define como ele deve trabalhar no projeto**.
---
# Estrutura do modelo Superprompt
```text
repo/
AGENTS.md
SYSTEM_MAP.md
ARCHITECTURE.md
.ai/
  SUPERPROMPT.md
engineering/
  tasks/
src/
.workspace/
```
A IA praticamente sempre lê **`.ai/SUPERPROMPT.md`**.
---
# O que vai dentro do SUPERPROMPT
Ele combina vários papéis:
- entrypoint da IA
- contexto técnico
- workflow de engenharia
- regras de comportamento
- protocolo de tasks
---
# Exemplo simplificado de SUPERPROMPT.md
```text
AI Engineering Protocol
Project context
Read these files first
AGENTS.md
SYSTEM_MAP.md
ARCHITECTURE.md
Engineering workflow
1 Understand system architecture.
2 Load task from engineering/tasks.
3 Identify modules involved.
4 Propose implementation plan.
5 Implement minimal change.
6 Generate tests for business logic.
7 Validate regression impact.
8 Prepare commit message and PR summary.
Coding rules
Prefer small functions.
Avoid modifying module boundaries.
Follow service-layer pattern in backend.
Testing rules
Business logic requires unit tests.
Avoid UI tests for logic.
Task protocol
Each task must contain
description
acceptance criteria
affected modules
```
---
# Como o fluxo funciona
Quando você começa uma tarefa:
```
Leia .ai/SUPERPROMPT.md
```
Depois a IA segue automaticamente:
```
context
↓
task
↓
plan
↓
implement
↓
test
↓
deliver
```
---
# Comparação dos modelos
|Modelo|Arquivos de controle|Complexidade|
|---|---|---|
|Arquitetura modular|10–20|média|
|Arquitetura enxuta|~7|baixa|
|Superprompt|1|muito baixa|
---
# Vantagens do Superprompt
- contexto centralizado
- menos fragmentação
- raciocínio mais consistente
- manutenção mais simples
---
# Limitação
Se o projeto crescer muito, o superprompt pode ficar **grande demais**. Por isso muitos times usam um híbrido:
```
.ai/
SUPERPROMPT.md
context.md
```
Ainda assim mantém poucos arquivos.
---
# Para o seu caso
Pelo tipo de organização que você já criou, o modelo que tende a funcionar melhor é:
**Arquitetura enxuta (7 arquivos)**
Ela equilibra:
- clareza para IA
- simplicidade
- escalabilidade
---
Se quiser, posso também te mostrar **qual dessas arquiteturas é hoje considerada a mais estável entre devs que usam IA todos os dias (Cursor + Claude)**, porque uma delas está claramente vencendo na prática.