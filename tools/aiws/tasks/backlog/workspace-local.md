# BACKLOG: Workspace Local da IA (Memória Não Versionada)

## Ideia

Criar uma pasta `.workspace/` (fora do git) como memória pessoal e scratchpad da IA — separada do repositório versionado.

## Estrutura proposta

```
.workspace/         ← no .gitignore
  memory/
    insights.md     ← padrões descobertos no projeto
    patterns.md     ← convenções observadas em prática
    pitfalls.md     ← armadilhas conhecidas
  analysis/
    architecture-notes.md
    system-review.md
  tasks/
    current-task.md ← contexto da task ativa (scratchpad)
    scratch-plan.md ← rascunho de plano antes de formalizar
  experiments/
    prototype-notes.md
```

## Por que fazer

- Hoje a IA não tem onde anotar descobertas temporárias sem poluir o repo
- `.workspace/` seria um espaço de trabalho descartável — não entra no git
- `memory/pitfalls.md` seria especialmente valioso: armadilhas conhecidas do projeto

## Diferença do memory/ do Claude

- `.claude/memory/` = memória persistente entre sessões (já existe)
- `.workspace/` = scratchpad da sessão atual, mais rico e estruturado

## Considerações

- Requer disciplina: a IA precisaria ser instruída a usar `.workspace/` no AGENTS.md
- Pode ser overkill para o estágio atual — mais útil quando projeto crescer

## Fonte
`to_review/AI Eng WS v3/AI CLI 2 ws.md`, `to_review/Gerador/1-AI Engineering Cockpit.md`
