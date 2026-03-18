# Execute Plan: TK-102 Realocacoes

## Execution status

1. Fase 1: concluida em 2026-03-14.
2. Fase 2: concluida em 2026-03-14.
3. Fase 3: concluida em 2026-03-14.
4. Fase 4: concluida em 2026-03-14.
5. Fase 5: concluida em 2026-03-14.
6. Status geral: execucao concluida.

## Regras de execucao (guardrails)

1. Nao alterar estrutura de frontend em nenhuma etapa.
2. Focar somente em monitor/, docker/, docker/scripts/, docs/ e arquivos de governanca.
3. Se algum caminho antigo for referenciado em runtime, criar shim antes de remover o caminho legado.
4. Executar validacoes ao final de cada bloco de mudancas.

## Ordem de execucao por fases

Fase 1 - Preparacao: confirmar escopo, levantar referencias de caminhos em monitor/engine, docker/compose, docker/scripts.
Fase 2 - Consolidacao operacional: padronizar destino de saidas do monitor, consolidar scripts de runtime docker, atualizar referencias em compose e scripts.
Fase 3 - Fronteiras arquiteturais: reforcar que apps/api e o backend oficial; eliminar ambiguidades fora do frontend.
Fase 4 - Documentacao e governanca: atualizar docs/project-structure.md, .ai/repo-map.md, monitor/README.md, AGENTS.md.
Fase 5 - Verificacao e aceite: busca global por referencias antigas, quality gates, verificacao manual.

## Checklist de aceite final

1. Nao houve move/rename em app/, components/, hooks/, lib/ e styles/ — atendido.
2. Caminhos operacionais de monitor/docker/scripts consolidados — atendido.
3. Compose dev/prod funcional apos consolidacao — atendido.
4. Documentacao atualizada e coerente — atendido.
5. Lint, type-check, testes, build, validate-env em desenvolvimento passaram — atendido.
