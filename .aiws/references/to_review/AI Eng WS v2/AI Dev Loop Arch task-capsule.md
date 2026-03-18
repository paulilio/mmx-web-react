**Task Capsules** são uma evolução do modelo de tasks. A ideia é dar à IA **todo o contexto necessário para executar uma tarefa sem depender da memória da conversa**. Isso melhora muito o desempenho em editores como Cursor, Claude Code e GitHub Copilot.

Em vez de apenas um arquivo de task simples, cada tarefa vira uma **capsule autossuficiente**.

---

# Estrutura de uma Task Capsule

Dentro de `engineering/backend/tasks/`:

```text
engineering/backend/tasks/

BE-004/
  task.md
  context.md
  plan.md
  implementation.md
  tests.md
  notes.md
```

---

# Papel de cada arquivo

**task.md**

Descrição da tarefa.

```text
Task: BE-004
Title: Fix billing discount calculation

Description
Correct discount calculation when multiple coupons are applied.

Acceptance Criteria
- discount calculation correct
- unit tests passing
- no regression in billing service
```

---

**context.md**

Contexto técnico relevante.

```text
Relevant Modules
src/backend/billing/

Related Files
billingService.ts
couponCalculator.ts

Architecture Notes
Billing follows service-layer pattern.
```

---

**plan.md**

Plano criado pela IA.

```text
Implementation Plan

1 locate coupon calculation
2 adjust discount aggregation logic
3 update service tests
```

---

**implementation.md**

Registro do que foi feito.

```text
Changes

Updated couponCalculator.ts
Adjusted aggregation logic for stacked coupons
```

---

**tests.md**

Testes associados.

```text
Tests

billingService.test.ts
Added stacked coupon scenario
```

---

# Estrutura final no projeto

```text
repo/

AGENTS.md
PROJECT_MAP.md
ENTRYPOINTS.md
ARCHITECTURE.md

.ai/
  commands/
  context/

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

# Como a IA usa isso

Fluxo típico:

1. `/start-task BE-004`
    
2. IA lê `task.md` e `context.md`
    
3. IA escreve `plan.md`
    
4. IA implementa código
    
5. IA escreve `tests.md`
    
6. IA registra `implementation.md`
    

Isso cria **memória persistente da execução**.

---

# Benefícios

- menos perda de contexto
    
- tarefas complexas ficam organizadas
    
- histórico técnico documentado
    
- fácil retomada de trabalho
    
- excelente para colaboração humano + IA
    

---

# Quando usar

Use Task Capsules quando:

- tarefas são complexas
    
- envolvem múltiplos arquivos
    
- podem durar vários dias
    

Para tarefas pequenas, um único `task.md` basta.

---

Se quiser, posso mostrar também algo ainda mais avançado usado em 2026 chamado **Context Capsules**.  
Elas resolvem um problema comum: quando a IA precisa entender **partes grandes do sistema sem ler o repo inteiro**.