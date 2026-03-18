É contra-intuitivo, mas **muitos arquivos de contexto pioram o raciocínio da IA**. Isso acontece por três motivos técnicos importantes.
Vou explicar de forma direta.
---
# 1. Fragmentação de contexto
Quando você cria muitos arquivos:
```
.ai/context/
  architecture.md
  coding-rules.md
  testing-rules.md
  api-rules.md
  task-rules.md
  module-rules.md
```
o agente precisa:
1. descobrir quais arquivos existem
2. decidir quais abrir
3. combinar mentalmente tudo
Isso aumenta muito a chance de:
- ignorar regras
- interpretar errado
- perder contexto
---
# 2. Window de contexto limitada
Modelos como os usados em:
- Claude Code
- Cursor
- GitHub Copilot
precisam carregar os arquivos no contexto.
Se você tem muitos arquivos pequenos:
```
10 arquivos × 300 linhas
```
é pior que:
```
1 arquivo × 300 linhas
```
porque o agente precisa **descobrir e carregar cada um separadamente**.
---
# 3. Problema de prioridade
Se o contexto estiver fragmentado, o modelo pode:
- carregar apenas parte das regras
- ignorar arquivos importantes
- aplicar regras inconsistentes
Isso gera decisões estranhas.
---
# Por isso muitos times migraram para
**contexto consolidado**.
Em vez de:
```
.ai/context/
  system.md
  coding.md
  testing.md
```
usar:
```
.ai/context.md
```
---
# Exemplo de context.md ideal
```
AI Engineering Rules
Architecture
Backend uses service-layer pattern.
Modules must remain independent.
Coding
Prefer pure functions.
Avoid large files.
Testing
Business logic requires unit tests.
Avoid UI testing for logic.
Tasks
All implementation must start from a task capsule.
```
Tudo em **um único lugar**.
---
# Estrutura ideal simplificada
```
repo/
AGENTS.md
SYSTEM_MAP.md
ARCHITECTURE.md
PROJECT_MAP.md
.ai/
  README.md
  context.md
  commands.md
engineering/
  tasks/
src/
.workspace/
```
---
# Regra prática usada por times AI-native
**Máximo recomendado de arquivos de contexto:**
```
4–7 arquivos
```
Mais que isso começa a prejudicar.
---
# A arquitetura que você chegou está muito boa
Ela tem:
- contexto centralizado
- comandos claros
- tasks organizadas
- workspace separado
Isso já é **nível avançado de AI-native development**.
---
Se quiser, posso te mostrar **um insight muito interessante que surgiu em 2026**:
por que alguns times estão **abandonando `/commands` e voltando para prompts únicos muito bem estruturados**. Isso também é contra-intuitivo, mas tem uma explicação técnica forte.