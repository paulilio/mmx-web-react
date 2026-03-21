# TK-100b: Alpha Infra — Vercel + PostgreSQL + Deploy
Type: chore

## Objective
Publicar o app na Vercel (free) conectado ao PostgreSQL, com migrações aplicadas e smoke P0 validado em ambiente externo.

## Context
Backend e frontend P0 estão prontos (ver tk-100a). O bloqueador restante para Alpha é a infra: banco PostgreSQL provisionado, variáveis de ambiente configuradas na Vercel e smoke test funcional em ambiente publicado.

## Plan
- [x] Fase A: provisionar PostgreSQL — Neon (projeto mmx-platform, região us-east-1)
- [x] Fase B: configurar Vercel — projeto mmx-platform linkado, env vars production
- [x] Fase B: configurar Railway — backend @mmx/api, Dockerfile multi-stage, entrypoint.sh
- [x] Fase C: aplicar migrações Prisma no Neon (9 migrações aplicadas)
- [x] Fase C: resolver conflito de versão Prisma CLI vs client (6.4.1 → 6.19.2)
- [x] Fase C: resolver Prisma client não encontrado no runner (pnpm deploy --prod não copia .prisma/)
- [x] Fase C: configurar JWT_ACCESS_SECRET e JWT_REFRESH_SECRET no Railway
- [x] Fase C: configurar NEXT_PUBLIC_API_BASE no Vercel
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

## Estado atual (2026-03-21)
- Neon: ✅ provisionado, 9 migrações aplicadas
- Railway: ✅ deploy ok — https://mmxapi-production.up.railway.app
- Vercel: ✅ linkado — https://mmx-platform.vercel.app (aguardando redeploy com NEXT_PUBLIC_API_BASE)
- JWT secrets: ✅ configurados no Railway
- validate:env production: pendente
- Smoke P0: pendente
- Investigação Docker/Prisma: .aiws/knowledge/inv-prisma-client-docker-deploy.md
