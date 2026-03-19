# DONE: Estrutura do Workspace (.ai + .aiws)

## O que foi implementado

Separação em duas camadas:

- `.ai/` — Context Kernel: regras operacionais, arquitetura, mapa do código, superfícies de impacto
- `.aiws/` — Workspace Operacional: tasks, knowledge, references, runs, templates

## Decisões de design aplicadas

### Entrypoint único para IA
`AGENTS.md` na raiz → aponta para `.ai/` como hub de contexto. Evita fragmentação e garante que a IA sempre carregue o contexto certo antes de agir.

### Contexto estável separado de trabalho operacional
Arquivos em `.ai/` raramente mudam (só quando arquitetura muda). Trabalho do dia a dia fica em `.aiws/`. Essa separação evita que o contexto da IA seja contaminado por ruído operacional.

### Pipeline de tasks com 3 estados
`backlog/` → `doing/` → `done/` — cada task em pasta própria com `1-task.md` e `ref/` para histórico.

### Knowledge por domínio com prefixos de tipo
`knowledge/product/`, `knowledge/architecture/`, `knowledge/ops/` — arquivos com prefixos `con-`, `dec-`, `pat-`, `inv-`, `rev-` indicando o tipo de conhecimento.

### References global vs ref/ por task
- `references/` — material externo, guias, seed data (global ao projeto)
- `tasks/<tk>/ref/` — histórico e documentos específicos da task

## Fonte
Consolidado a partir de: `to_review/Ai Eng WS/`, `to_review/AI Eng WS v2/`, `to_review/AI Eng WS v3/`, `to_review/Estrutura Definitiva/`
