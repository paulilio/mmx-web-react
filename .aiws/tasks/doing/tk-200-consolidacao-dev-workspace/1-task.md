# TK-200: Consolidar histórico do .dev-workspace no .aiws
Type: chore

## Objective
Migrar todo o histórico relevante do .dev-workspace para a estrutura .aiws, preservando contexto e preparando a remoção do .dev-workspace.

## Context
O .dev-workspace (symlink para Google Drive) foi a estrutura operacional usada com Copilot antes da migração para o modelo .aiws. Contém tasks executadas, planos de fase futura, roadmaps e definições de produto. Todo esse material precisa ser absorvido pela nova estrutura sem perda de informação.

## Plan
- [x] Atualizar AGENTS.md e README.md com tasks/doing/ e tasks/backlog/
- [x] Criar tk-200 em doing/ (este arquivo)
- [x] Criar tk-100a em done/ com ref/ (backend readiness + frontend P0)
- [x] Criar tk-100b em doing/ com ref/ (infra Alpha — em andamento)
- [x] Corrigir tk-101 em done/ — reescrever no formato task.md com ref/
- [x] Criar tk-102 em done/ com ref/ (consolidação operacional)
- [x] Criar tk-103 em done/ com ref/ (alinhamento front-back)
- [x] Criar 6 tasks em backlog/ com ref/ (planos de fase futura)
- [x] Criar 4 knowledge files em .aiws/knowledge/

## Code Surface
- .ai/AGENTS.md
- .aiws/README.md
- .aiws/tasks/

## Constraints
- Preservar histórico original intacto em ref/ dentro de cada task
- Não apagar .dev-workspace — decisão de remoção fica com o usuário após conclusão
- Tasks de backlog: usar formato task.md enxuto (objective + context + plan esboçado)

## Validation
- Todas as tasks com ref/ contendo arquivos originais do .dev-workspace
- Nenhuma informação relevante perdida
- AGENTS.md e README.md refletindo a estrutura doing/backlog/done

## Definition of Done
- [ ] 4 tasks em done/ (tk-100a, tk-101 corrigido, tk-102, tk-103)
- [ ] 2 tasks em doing/ (tk-100b, tk-200)
- [ ] 6 tasks em backlog/ (tk-201 a tk-206)
- [ ] 4 knowledge files em knowledge/
- [ ] Todas as tasks com ref/ preservando histórico original
- [ ] .dev-workspace pronto para remoção (sem perda de informação)
