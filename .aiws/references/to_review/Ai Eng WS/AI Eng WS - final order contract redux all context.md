Sim. A pasta **`.ai/context/`** é um refinamento muito útil quando o projeto cresce.  
Ela permite **dividir o contexto em blocos menores**, o que melhora a leitura da IA e reduz consumo de tokens.

A ideia é simples:  
em vez de um arquivo grande com tudo, você cria **contextos especializados**.

Isso funciona bem com Claude Code, Cursor e GitHub Copilot.

---

# Estrutura com `.ai/context`

```text
repo/

AGENTS.md
AI.md

docs/
  system.md
  workflow.md
  knowledge.md
  contracts.md

.ai/
  commands/
  context/

engineering/
  tasks/

src/

PROJECT_INDEX.md

.workspace/
```

---

# Conteúdo da pasta `.ai/context`

```text
.ai/context/

architecture.md
coding-rules.md
testing-rules.md
task-rules.md
api-rules.md
```

Cada arquivo é um **bloco de conhecimento específico**.

---

# Exemplo: architecture.md

```text
# Architecture Context

Backend
src/backend/

Frontend
src/frontend/

Automation
src/automation/

Rules

Controllers contain no business logic.
Services contain domain logic.
Repositories handle persistence only.
```

---

# Exemplo: coding-rules.md

```text
# Coding Rules

Prefer small functions.

Avoid hidden side effects.

Do not introduce new dependencies without justification.

Always follow module boundaries defined in system.md.
```

---

# Exemplo: testing-rules.md

```text
# Testing Rules

All new logic must have tests.

Backend
Use unit tests for services.

Frontend
Test hooks and critical UI flows.

Automation
Use pytest.
```

---

# Exemplo: task-rules.md

```text
# Task Rules

All changes must start from a task.

Task location:

engineering/tasks/{TASK-ID}

Files required

task.md
plan.md
review.md
```

---

# Exemplo: api-rules.md

```text
# API Rules

Frontend must call APIs only through the API client.

Location

src/frontend/api/client.ts

Do not call fetch directly inside components.
```

---

# Atualização do AI.md

AI.md vira apenas um **orquestrador de contexto**.

```text
# AI Entry Point

Before implementing changes read:

1 docs/system.md
2 docs/workflow.md
3 docs/knowledge.md
4 docs/contracts.md
5 PROJECT_INDEX.md

Additional context:

.ai/context/architecture.md
.ai/context/coding-rules.md
.ai/context/testing-rules.md
.ai/context/task-rules.md
.ai/context/api-rules.md
```

---

# Benefício real

Comparação.

Sem `.ai/context`

- contexto muito grande
    
- IA lê tudo sempre
    

Com `.ai/context`

- IA lê apenas o necessário
    
- melhor raciocínio
    
- menos tokens
    

---

# Estrutura final recomendada

```text
repo/

AGENTS.md
AI.md

docs/
  system.md
  workflow.md
  knowledge.md
  contracts.md

.ai/
  commands/
  context/

engineering/
  tasks/

src/

PROJECT_INDEX.md

.workspace/
```

---

# Resultado

Seu projeto passa a ter:

• entrada automática de contexto  
• contexto modular para IA  
• workflow estruturado  
• memória de projeto  
• comandos de engenharia

Isso é praticamente o que alguns times chamam hoje de **AI Engineering Workspace completo**.

---

Se quiser, posso ainda te mostrar **um insight muito interessante**:  
por que muitos projetos AI-native estão começando a trocar **AI.md por uma pasta chamada `.ai/` como entrypoint principal**, e por que isso melhora muito a navegação da IA.