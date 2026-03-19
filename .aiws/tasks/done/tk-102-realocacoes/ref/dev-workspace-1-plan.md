# Plan: TK-102 Realocacoes (Sem Alterar Estrutura Frontend)

Objetivo: melhorar organizacao arquitetural e operacional sem mover ou renomear pastas/arquivos de frontend.

Escopo fechado: nenhuma mudanca estrutural em app/, components/, hooks/, lib/ e styles/.

## Steps

1. Fase 1 - Preparacao e guardrails
2. Registrar regra de nao-alteracao estrutural do frontend
3. Criar mapa de realocacao apenas para caminhos operacionais (monitor/, docker/scripts/, docker/)
4. Fase 2 - Consolidacao operacional (infra/monitor)
5. Separar claramente codigo do monitor versus saidas geradas
6. Consolidar scripts de runtime docker para arvore docker/ operacional
7. Fase 3 - Fronteiras arquiteturais (sem mover frontend)
8. Manter app/api somente para endpoints locais/tecnicos
9. Documentar limite formal frente ao backend oficial apps/api
10. Fase 4 - Documentacao e governanca
11. Atualizar docs de estrutura e mapa do repositorio
12. Fase 5 - Verificacao e aceite
13. Executar quality gates de desenvolvimento
14. Validar manualmente docker-compose dev com monitor ativo

## Decisions

- Incluido: consolidacao operacional e governanca fora do frontend
- Excluido: reorganizacao de estrutura frontend e refatoracao funcional
- Assuncao: backend oficial permanece em apps/api; app/api segue restrito a necessidades locais/tecnicas

## Relevant files

- monitor/engine/runner.js — normalizar paths de entrada/saida
- monitor/engine/report.js — emissao em destino operacional consolidado
- docker/compose/docker-compose.dev.yml, docker-compose.prod.yml
- docker/scripts/run-compose.mjs, wait-for-db.sh, migrate-and-start.sh
- docs/project-structure.md
- AGENTS.md — reforcar fronteira app/api vs apps/api
