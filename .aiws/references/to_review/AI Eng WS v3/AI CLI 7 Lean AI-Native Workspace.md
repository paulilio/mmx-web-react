Entre devs que usam IA **todos os dias** com ferramentas como Cursor, Claude Code e GitHub Copilot, um padrão acabou se consolidando porque funciona melhor na prática.
Ele não é o **superprompt puro**, nem a **arquitetura cheia de arquivos**.
O modelo que mais aparece hoje é o **Lean AI-Native Workspace**.
Ele mantém **poucos arquivos**, mas ainda separa responsabilidades importantes.

---
# Estrutura que mais está vencendo na prática
```text
repo/
AGENTS.md
SYSTEM_MAP.md
ARCHITECTURE.md
.ai/
  README.md
  context.md
  workflow.md
engineering/
  tasks/
src/
.workspace/
```
São apenas **6 arquivos de controle**.
---
# Por que esse modelo está vencendo
Ele resolve três problemas que apareceram nos últimos anos.
### 1. Menos fragmentação
Contexto fica concentrado:
```
context.md
```
---
### 2. Workflow claro
Fluxo de engenharia fica em:
```
workflow.md
```
---
### 3. Entrada única da IA
Arquivo:
```
.ai/README.md
```
Ele explica **como a IA deve operar no projeto**.
---
# O papel de cada arquivo
### AGENTS.md
Regras gerais para agentes.
Exemplo:
```
Agents must respect module boundaries.
Always generate tests for business logic.
Prefer incremental changes.
```
---
### SYSTEM_MAP.md
Mapa estrutural do sistema.
```
backend
frontend
automation
```
---
### ARCHITECTURE.md
Padrões técnicos.
```
service layer
component architecture
testing strategy
```
---
### .ai/README.md
Entrada da IA.
```
Load context
Then read workflow
Then read task
```
---
### .ai/context.md
Regras de engenharia.
```
coding rules
testing rules
architecture constraints
```
---
### .ai/workflow.md
Loop de engenharia.
```
Understand system
Read task
Plan
Implement
Test
Deliver
```
---
# Estrutura mental
```
Project Brain
  AGENTS
  SYSTEM_MAP
  ARCHITECTURE
AI Layer
  context
  workflow
Execution
  engineering/tasks
```
---
# Por que isso funciona melhor
Ele evita três erros comuns:
❌ muitos arquivos de contexto  
❌ comandos fragmentados  
❌ prompts espalhados
E mantém apenas o que realmente melhora o raciocínio da IA.
---
# Resultado
Esse modelo mantém os quatro pilares do desenvolvimento com IA:
• Context-Driven Development  
• Task-Driven Development  
• Project Memory  
• AI Workflow
Com **estrutura extremamente simples**.
---
💡 Se quiser, posso te mostrar uma coisa que quase ninguém percebeu ainda e que melhora muito projetos com IA:
**por que `SYSTEM_MAP.md` é provavelmente o arquivo mais importante de todo o repo quando se trabalha com IA.**