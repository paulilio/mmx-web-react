Sim. O **WORKFLOW.md** fecha o sistema.  
Ele define **como o desenvolvimento acontece do início ao fim**. Isso evita que a IA pule etapas como planejamento, testes ou revisão.

Ele melhora bastante a consistência ao trabalhar com Claude Code, Cursor e GitHub Copilot.

---

# Onde ele entra

Estrutura final simplificada:

```
repo/

AI_CONTEXT.md
SYSTEM.md
WORKFLOW.md
KNOWLEDGE.md
PROJECT_INDEX.md

engineering/
  tasks/
    backend/
    frontend/
    automation/

docs/
  decisions/

src/

.ai/
  commands/

.workspace/
```

---

# Papel de cada arquivo

AI_CONTEXT.md  
Guia de leitura da IA.

SYSTEM.md  
Arquitetura e regras técnicas.

WORKFLOW.md  
Processo de desenvolvimento.

KNOWLEDGE.md  
Regras de negócio e conhecimento acumulado.

PROJECT_INDEX.md  
Mapa do código.

---

# Estrutura recomendada do WORKFLOW.md

```
# Development Workflow

This repository follows a structured AI-assisted development workflow.

## Principles

- Every change starts with a task
- Code must follow system architecture
- Tests must be written or updated
- Changes must pass regression checks

## Task Lifecycle

1. Create task
2. Analyze context
3. Write plan
4. Implement change
5. Write tests
6. Run regression checks
7. Review changes
8. Ship

## Commands

The following AI commands are available.

doctor
start-task
task-scan
task-plan
write-tests
regression-check
task-done
ship

## Task Structure

engineering/tasks/{domain}/{TASK-ID}

task.md
plan.md
review.md

## Implementation Rules

Before writing code:

Read:

SYSTEM.md
KNOWLEDGE.md
PROJECT_INDEX.md

Understand the impacted modules.

Then create a plan.

Only after the plan is approved, implementation may begin.
```

---

# Como usar na prática

Quando iniciar um chat com IA:

```
Read AI_CONTEXT.md and WORKFLOW.md first.
```

A IA passa a entender:

- arquitetura
    
- conhecimento do sistema
    
- ciclo de desenvolvimento
    

---

# Resultado

Seu repositório passa a ter **5 camadas claras**.

```
AI Dev OS
   │
   ├ workflow
   │     WORKFLOW.md
   │
   ├ context
   │     AI_CONTEXT.md
   │
   ├ system
   │     SYSTEM.md
   │
   ├ knowledge
   │     KNOWLEDGE.md
   │
   └ code
         src/
```

---

# O que isso implementa

Essa estrutura cobre:

- Context-Driven Development
    
- Task-Driven Development
    
- Project Memory Layer
    
- AI Dev OS
    

com **menos arquivos e menos burocracia**.

---

Se quiser, posso ainda te mostrar **uma pequena reorganização dessa estrutura que muitos times AI-native estão usando em 2026**, chamada **AI Workspace Split**, que separa perfeitamente:

• o que vai para o git  
• o que é apenas contexto local da IA.