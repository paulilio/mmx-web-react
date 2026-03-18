# Roadmap - Infra Improvement (Opcao B)

## Objetivo
Convergir o MMX para arquitetura com frontend e backend separados, sem quebrar o produto atual e sem regressao de contratos.

## Arquitetura Alvo
- `mmx-web-react` (frontend Next.js)
- `mmx-api` (backend API dedicado)
- `postgres` (banco)
- `infra/docs` (docker/deploy/observabilidade)

Fluxo alvo:

```text
Browser
  -> mmx-web-react
  -> HTTP REST
  -> mmx-api
  -> PostgreSQL
```

## Fases

## Fase 1 - Alinhamento de documentacao e governanca
Escopo:
- Explicitar que `app/api/**` e uma etapa de transicao.
- Explicitar arquitetura alvo separada (Opcao B).
- Registrar regra: manter `lib/client/api.ts` como unica fronteira de dados no frontend.

Status: concluida em 2026-03-13.

## Fase 2 - Preparacao de transicao tecnica no frontend
Escopo:
- Garantir que hooks/componentes nao dependam de implementacao local de `app/api/**`.
- Consolidar chamadas via `lib/client/api.ts` e contratos estaveis.
- Criar matriz de migracao por dominio (transactions, categories, contacts, budget, auth, reports).

Status: em andamento (parcialmente concluida por convergencia atual do adaptador).

## Fase 3 - Introducao do `mmx-api`
Escopo:
- Criar servico backend dedicado.
- Replicar contratos HTTP atuais (`{ data, error }`) e politicas de autenticacao/cookies.
- Migrar dominios gradualmente, sem big-bang.

Status: planejada (roadmap tecnico criado em `.dev-workspace/product/2-roadmap/roadmap-mmx-api-bootstrap.md`).

## Fase 4 - Docker separado frontend/backend
Escopo:
- Compose dev/prod com `frontend`, `backend`, `postgres`.
- Ajustar `NEXT_PUBLIC_API_BASE` para backend dedicado.
- Ajustar pipeline de deploy para releases independentes.

Status: pendente (depende da Fase 3).

## Fase 5 - Opcional: monorepo
Escopo:
- Avaliar Turborepo apenas quando `mmx-api` estiver ativo e houver ganho real de pacotes compartilhados.

Status: pendente (decisao futura).

## Execucao realizada neste repositorio
1. README e docs atualizados para marcar `app/api/**` como transitorio.
2. Arquivos de governanca (`.ai`, `AGENTS`, `.github`) sincronizados com arquitetura alvo.
3. Regra preservada: nao criar caminho paralelo ao `lib/client/api.ts` no frontend atual.

## Status de Execucao (2026-03-13)
- Roadmap de evolucao para Opcao B criado neste arquivo.
- Etapas aplicaveis no repositorio atual executadas (documentacao + governanca).
- Etapas bloqueadas por dependencia externa registradas como pendentes (`mmx-api` dedicado e compose completo frontend/backend).
- Efeito aplicado no adaptador: migracao por dominio habilitada via `NEXT_PUBLIC_API_MIGRATION_DOMAINS` (piloto `reports`).
- Efeito aplicado em Docker: profile opcional `split` com servico `backend` preparado para stack `frontend+backend+postgres`.
- Checklist operacional criado para rollout por dominio: `.dev-workspace/product/1-definitions/mmx-api-domain-migration-checklist.md`.

## Proximos passos objetivos
1. Abrir repositorio `mmx-api` com contratos baseline.
2. Migrar 1 dominio piloto (recomendado: `reports` ou `categories`).
3. Validar em ambiente dev com compose `frontend + backend + postgres`.
4. Expandir migracao por dominios restantes.

## Referencia tecnica detalhada
- Bootstrap e piloto de migracao: `.dev-workspace/product/2-roadmap/roadmap-mmx-api-bootstrap.md`