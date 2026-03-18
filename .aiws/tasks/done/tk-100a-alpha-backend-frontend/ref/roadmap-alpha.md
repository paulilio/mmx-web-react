# MoedaMix - Roadmap Alpha

Data de referencia: 2026-03-11
Camada: Tatica (Roadmap de entrega para ambiente Alpha)

## 1. Objetivo do Roadmap Alpha

Objetivo executivo:
- Colocar o produto em condicao real de testes Alpha com backend validado, frontend funcional no fluxo principal e infraestrutura minima pronta para uso externo controlado.

Escopo deste roadmap:
- Revisao e fechamento de pendencias do backend (com base na Fase 1 ja executada).
- Revisao e organizacao das tarefas de frontend para repasse ao v0.
- Revisao e execucao da infraestrutura basica para banco PostgreSQL + publicacao na Vercel (free).

Fora de escopo neste momento:
- Otimizacoes de escala avancada.
- Observabilidade completa enterprise.
- Estrategias de monetizacao.

## 2. Premissas e Estado Atual

Premissas usadas neste planejamento:
- A Fase 1 esta em estado "Parcial avancado" e tecnicamente muito proxima de encerramento.
- Endpoints first-party centrais ja estao implementados (auth, transactions, categories, category-groups, contacts, budget, budget-allocations, areas, settings, reports).
- Fluxo de auth em API mode ja esta convergido para `/api/auth/*` com cookies e refresh server-side.
- Fase 2 (core features) esta parcial e precisa de recorte pratico para Alpha.

Risco principal atual:
- Iniciar Fase 2 sem gate objetivo de readiness pode aumentar retrabalho e atrasar a versao Alpha.

## 3. Estrutura do Novo Roadmap (3 Etapas)

## Etapa 1 - Revisao do Backend para Fechamento de Readiness

Objetivo:
- Confirmar o que falta para encerrar formalmente o bloco backend/seguranca e remover incerteza de base tecnica antes do Alpha.

Resultado esperado:
- Documento de fechamento backend com status final por item, evidencias e pendencias remanescentes priorizadas.

Atividades:
1. Consolidar status real da Fase 1 em uma lista unica de readiness:
   - contrato API (`{ data, error }`)
   - auth/JWT/refresh/logout
   - middleware de protecao
   - hardening (rate limit, CORS, cookies, headers)
   - OAuth Google/Microsoft
2. Executar gate tecnico minimo no estado atual:
   - `pnpm test:unit`
   - `pnpm test:integration`
   - `pnpm lint`
   - `pnpm type-check`
   - `pnpm build`
   - `pnpm validate:env -- --env=development`
3. Executar gate de env para producao baseline:
   - `pnpm validate:env -- --env=production`
4. Classificar pendencias backend em 3 grupos:
   - bloqueia Alpha
   - pode entrar no hardening pos-Alpha
   - divida tecnica monitorada
5. Registrar decisao formal:
   - "Backend pronto para Alpha" ou
   - "Backend pronto com restricoes" (listar restricoes).

Entregaveis:
- Checklist backend de readiness com evidencias objetivas.
- Lista curta de pendencias backend com owner e prazo.
- Decisao de saida da Etapa 1.

Criterio de saida da Etapa 1:
- Nenhum bloqueador critico aberto em auth, contrato API, seguranca baseline e build/testes.

## Etapa 2 - Revisao e Pacote de Tarefas Frontend para o v0

Objetivo:
- Definir um backlog enxuto e executavel para o v0 entregar uma experiencia Alpha testavel, sem abrir frentes paralelas.

Resultado esperado:
- Pacote de tarefas frontend priorizado para Alpha (escopo fechado), pronto para repasse ao v0.

## Etapa 3 - Revisao e Execucao da Infraestrutura Basica (Postgres + Vercel Free)

Objetivo:
- Subir ambiente minimo confiavel para testes Alpha externos com banco PostgreSQL e deploy publico controlado.

Resultado esperado:
- Aplicacao publicada na Vercel (free) conectada a PostgreSQL, com variaveis, migracoes e validacoes essenciais concluidas.

## 6. Definition of Done da Versao Alpha

A versao Alpha e considerada pronta para testes quando:
1. Backend estiver formalmente revisado e sem bloqueadores criticos.
2. Backlog frontend P0 estiver concluido e validado.
3. App estiver publicada na Vercel (free) com PostgreSQL ativo.
4. Fluxos essenciais passarem no smoke test de Alpha.
5. Houver registro de riscos conhecidos e plano pos-Alpha.
