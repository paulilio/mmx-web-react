# TK-102: Consolidação Operacional sem Alterar Frontend
Type: chore

## Objective
Consolidar organização operacional e fronteiras arquiteturais (monitor, docker, scripts, docs) sem mover ou renomear nada em app/, components/, hooks/, lib/ ou styles/.

## Context
Após o cutover do tk-101, a estrutura operacional (monitor, docker, scripts) estava com paths inconsistentes e ambiguidade entre app/api (frontend route handlers) e apps/api (backend oficial). Esta task reorganizou a camada operacional e documentou as fronteiras sem tocar o frontend.

## Plan
- [x] Fase 1: baseline — mapa de realocações, sem alterar estrutura de frontend
- [x] Fase 2: consolidação operacional — monitor, docker/compose, docker/scripts
- [x] Fase 3: fronteiras arquiteturais — documentar app/api vs apps/api sem mover frontend
- [x] Fase 4: documentação e governança — project-structure.md, repo-map.md, monitor/README.md, AGENTS.md
- [x] Fase 5: verificação e aceite — gates completos + validação manual

## Code Surface
- monitor/engine/runner.js, monitor/engine/report.js
- docker/compose/docker-compose.dev.yml, docker/compose/docker-compose.prod.yml
- docker/scripts/
- docs/project-structure.md
- .ai/repo-map.md (se existir), AGENTS.md

## Constraints
- Nenhuma alteração estrutural em app/, components/, hooks/, lib/, styles/
- Alterações restritas a monitor/, docker/, scripts/, docs/ e arquivos de governança
- Shim temporário de compatibilidade antes de remover path legado

## Validation
- pnpm lint, type-check, test:unit, test:integration, build, validate:env development: todos ok
- docker-compose dev funcional com caminhos consolidados
- monitor gerando relatórios/evidências no destino novo
- Busca global por referencias de caminhos antigos: zerada

## Definition of Done
- [x] Escopo respeitado — frontend sem reorganização estrutural
- [x] Consolidação operacional concluída e funcionando
- [x] Documentação e governança sincronizadas com o código
- [x] Validações automatizadas e manuais aprovadas
