Você escolheu a opção **1**, então vamos direto ao ponto:
**como montar o engenheiro virtual permanente no seu workspace**.

A ideia é criar **um único arquivo de identidade da IA** que controla todo o comportamento dela.

---

# 1. Arquivo central da IA

Crie:

```
.workspace/ai-engineer.md
```

Conteúdo recomendado:

```
ROLE

You are the AI software engineer responsible for planning and implementing features in this repository.

OBJECTIVE

Plan, implement, review, and improve code while maintaining architecture consistency.

GENERAL RULES

Always read kernel documentation before working.
Follow coding conventions.
Prefer simple and maintainable solutions.
Avoid unnecessary complexity.
Keep modules loosely coupled.

WORKFLOW

1 Analyze the repository and relevant modules.
2 Read the task or specification.
3 Produce a short implementation plan.
4 Implement the solution.
5 Run a self-review and propose improvements.

OUTPUT EXPECTATIONS

When implementing:

- explain decisions briefly
- list modified files
- show important code snippets
```

Esse arquivo vira o **cérebro operacional da IA**.

---

# 2. Kernel do projeto

Agora crie a memória do sistema.

```
.workspace/kernel
```

Arquivos essenciais:

```
architecture.md
stack.md
conventions.md
modules.md
```

Exemplo simples de `architecture.md`:

```
System architecture

API Layer
Controllers expose REST endpoints.

Application Layer
Contains business logic.

Infrastructure Layer
Handles database, external APIs, logging.

Dependency rule

Controllers → Services → Repositories
```

Isso evita que a IA invente arquitetura errada.

---

# 3. Pasta de tarefas

```
.workspace/tasks
```

Exemplo:

```
.workspace/tasks/DC-4162.md
```

Conteúdo:

```
Goal

Create data-read endpoints for BidDay public API.

Requirements

Return project metadata
Return bid summary
Follow current API authentication

Expected endpoints

GET /api/projects/{id}
GET /api/projects/{id}/summary
```

---

# 4. Execução da tarefa

Prompt simples:

```
Read .workspace/ai-engineer.md

Read kernel documentation

Read the task file

Execute the implementation workflow
```

A IA faz:

1 análise
2 plano
3 implementação
4 revisão

---

# 5. Revisão automática

Depois peça:

```
Review the implementation.

Check:

architecture consistency
naming conventions
duplication
missing validations
security concerns
```

---

# 6. Seu papel

Você faz apenas:

• revisar plano
• revisar spec
• revisar resultado final

Você entra no código **só para pequenos ajustes**.

Exemplo:

* edge case
* ajuste de naming
* validação extra

---

# 7. Resultado esperado

Quando bem configurado:

Tempo típico de feature:

dev tradicional
3 a 5 horas

AI-driven workflow
30 a 90 minutos

Porque a IA faz **quase toda a escrita de código**.

---

# 8. Próximo passo que realmente muda o jogo

Existe um upgrade desse modelo chamado:

**Task-driven AI workspace**

Ele faz a IA:

* quebrar tarefas automaticamente
* planejar dependências
* gerar specs
* executar

Praticamente vira um **mini time de engenharia automático**.

Se quiser, eu posso te mostrar **a estrutura completa desse modelo**, que hoje é uma das mais eficientes para devs que querem trabalhar quase só como **arquiteto e revisor**.
