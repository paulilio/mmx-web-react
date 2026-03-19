# TK-100b: Alpha Infra — Vercel + PostgreSQL + Deploy
Type: chore

## Objective
Publicar o app na Vercel (free) conectado ao PostgreSQL, com migrações aplicadas e smoke P0 validado em ambiente externo.

## Context
Backend e frontend P0 estão prontos (ver tk-100a). O bloqueador restante para Alpha é a infra: banco PostgreSQL provisionado, variáveis de ambiente configuradas na Vercel e smoke test funcional em ambiente publicado.

## Plan
- [ ] Fase A: provisionar PostgreSQL (escolher provider free, criar instância, obter DATABASE_URL)
- [ ] Fase B: configurar Vercel (Node 22, env vars em preview e production)
- [ ] Fase C: aplicar migrações Prisma no banco de preview
- [ ] Fase D: gates técnicos + validate:env production
- [ ] Fase D: smoke test P0 em ambiente publicado (login, CRUD, budget, settings)

## Code Surface
- apps/api/prisma/migrations/ — 5 migrações pendentes de aplicar
- scripts/validate-env.mjs — validação de envs
- .env.example — referência de variáveis necessárias

## Constraints
- Node 22 na Vercel (alinhado ao package.json)
- NEXT_PUBLIC_USE_API=true obrigatório
- Sem fallback automático para mock em falha de conectividade
- credentials: "include" para chamadas externas (NEXT_PUBLIC_API_BASE)
- Não expor segredos em logs ou arquivos commitados

## Validation
- pnpm validate:env -- --env=production: zero erros
- Deploy preview sem erro de build
- Smoke P0 completo em ambiente publicado

## Definition of Done
- [ ] PostgreSQL provisionado e DATABASE_URL configurada
- [ ] Vercel configurada (Node 22, todas as env vars)
- [ ] Migrações aplicadas (5 pendentes)
- [ ] validate:env production sem erros
- [ ] Smoke P0 passando em ambiente externo
- [ ] URLs de preview e production registradas

## Estado atual (2026-03-12)
- prisma:generate: ok
- prisma migrate status: 5 migrações pendentes
- validate:env development: ok com warnings
- validate:env production: 9 erros (envs ausentes: DATABASE_URL, MMX_APP_ENV, CORS_ORIGINS_PROD, GOOGLE_*, MICROSOFT_*)
- Vercel: não configurada
- Deploy: não executado
