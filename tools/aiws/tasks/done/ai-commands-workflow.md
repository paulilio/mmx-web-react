# DONE: AI Commands e Workflow Padronizado

## O que foi implementado

Pasta `.ai/commands/` com comandos reutilizáveis que a IA executa como slash commands:

- `start-task.md` — inicia uma task carregando contexto e plano
- `task-plan.md` — gera plano técnico antes de implementar
- `write-tests.md` — geração de testes para o escopo da task
- `regression-check.md` — validação de regressão após implementação
- `ship.md` — checklist de entrega
- `analyze-task.md` — análise de escopo e impacto
- `kernel-check.md` — verifica consistência do Context Kernel
- `spec-review.md` — revisão de spec antes de implementar
- `task-done.md` — encerra task e move para done/
- `task-loop.md` — loop contínuo de execução

## Decisões de design aplicadas

### Comandos como arquivos markdown
Cada comando é um arquivo `.md` com instrução para a IA. Claude Code e Cursor suportam nativamente. Copilot requer dispatcher no AGENTS.md.

### Separação por tipo de raciocínio
Comandos organizados por fase: análise → engenharia → entrega. Evita que a IA misture contextos.

### Menos comandos = melhor raciocínio
Insight crítico do v3: muitos comandos aumentam carga cognitiva da IA e pioram qualidade. O conjunto atual (10 comandos) é o mínimo funcional.

## Fonte
Consolidado a partir de: `to_review/AI Eng WS v3/AI CLI.md`, `to_review/AI Eng WS v3/AI CLI 5 menos-comandos.md`, `to_review/Ai Eng WS/AI Eng WS - final order contract redux.md`
