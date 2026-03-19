# BACKLOG: Context Capsules (Contexto por Módulo)

## Ideia

Criar pacotes de contexto por módulo do sistema, permitindo que a IA entenda um módulo específico sem precisar ler o repositório inteiro.

## Estrutura proposta

```
.ai/context/modules/
  auth.md            ← propósito, atores, operações principais, regras, dependências
  transactions.md
  budget.md
  categories.md
  reports.md
  settings.md
  ...
```

Cada arquivo responde: o que o módulo faz, quem usa, quais operações principais, regras importantes, onde está no código.

## Por que fazer

- Hoje a IA precisa explorar `apps/api/src/modules/` para entender cada domínio
- Com context capsules, carrega apenas o módulo relevante para a task
- Reduz tokens consumidos, melhora foco, diminui alucinação
- Especialmente útil para tasks de domínio único (ex: "corrigir bug em budget")

## Relação com o modelo atual

Complementa `knowledge/architecture/` — knowledge registra decisões, context capsule registra **como o módulo funciona hoje** (operacional, não histórico).

## Fonte
`to_review/AI Eng WS v2/AI Dev Loop Arch task-capsule context-capsule.md`, `to_review/Estrutura Definitiva/Extra 2.md`
