# TK-XXX: Titulo
Type: feature | bugfix | spike | refactor | chore

## Objective
[Uma frase. O que precisa ser feito.]

## Context
[Por que precisa ser feito. Links para references se houver.]

## Plan
- [ ] Etapa 1
- [ ] Etapa 2
- [ ] Etapa 3

> Comandos reutilizaveis disponiveis em .ai/commands/ — usar quando aplicavel.
> Pipelines sugeridos por tipo:
> - feature: start-task → task-plan → write-tests → regression-check → task-done → ship
> - feature complexa: start-task → analyze-task → write-tests → regression-check → task-done → ship
> - bugfix simples: task-loop → ship
> - bugfix complexo: start-task → analyze-task → regression-check → task-done → ship
> - spike: start-task → task-plan → task-done
> - refactor: start-task → regression-check → task-done → ship
> - chore: task-done

## Code Surface
- path/to/file.ts
- path/to/other.ts

## Constraints
- [Restricoes que limitam a implementacao]

## Validation
- [Como verificar que esta correto]

## Definition of Done
- [Criterios de aceite]

---
> Task simples: salvar como tasks/tk-XXX-nome/1-task.md
> Task complexa (Capsule): usar template em templates/task-capsule/ — pasta com 1-task.md, 2-plan.md, 3-execute.md e 4-phase-N.md
