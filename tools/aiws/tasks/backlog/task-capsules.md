# BACKLOG: Task Capsules (Tasks Autossuficientes)

## Ideia

Evoluir o formato de task atual para uma estrutura autossuficiente que contém tudo que a IA precisa para executar sem buscar contexto externo.

## Estrutura proposta

\`\`\`
tasks/<tk>/
  1-task.md          ← objetivo, contexto, plano, DoD (já existe)
  2-context.md       ← módulos relevantes, entrypoints, dependências (NOVO)
  3-plan.md          ← plano técnico detalhado gerado pela IA (NOVO)
  4-implementation.md ← registro de mudanças durante execução (NOVO)
  5-tests.md         ← testes associados à task (NOVO)
  ref/               ← histórico e documentos originais (já existe)
\`\`\`

## Por que fazer

- Task atual (`1-task.md`) define objetivo mas não captura contexto de execução
- IA precisa re-explorar o código a cada sessão para entender o que é relevante
- Task Capsule resolve isso: contexto capturado uma vez, reutilizado em todas as sessões
- Permite retomada fácil de tasks longas sem perda de memória

## Considerações

- Aumenta overhead por task — vale para tasks complexas (doing/), não para backlog simples
- `2-context.md` pode ser gerado pelo comando `/start-task` ao iniciar a task
- `3-plan.md` já existe em algumas tasks como arquivo separado

## Fonte
`to_review/AI Eng WS v2/AI Dev Loop Arch task-capsule.md`, `to_review/AI Eng WS v2/AI Dev Loop Arch task-capsule context-capsule.md`
