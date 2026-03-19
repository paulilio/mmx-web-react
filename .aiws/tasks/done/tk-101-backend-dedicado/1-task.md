# TK-101: Refatoração Definitiva Backend (NestJS + Prisma + DDD)
Type: refactor

## Objective
Substituir a arquitetura backend legada por Modular Monolith + DDD em corte único (Big Bang), consolidando apps/api como source of truth definitivo.

## Context
O backend existia como first-party API dentro do Next.js (app/api/), sem separação arquitetural real. A decisão foi migrar para backend dedicado em apps/api com NestJS + Prisma + DDD, sem coexistência com o legado.

## Plan
- [x] Fase 0: preparação e baseline técnico (inventário endpoints, contratos, segurança, gates)
- [x] Fase 1: foundation (main.ts, AppModule, PrismaModule, bootstrap global, health)
- [x] Fase 2: segurança cross-cutting (JWT, refresh rotation, cookies, rate limit, CORS, OAuth)
- [x] Fase 3: bounded context auth e health (DDD completo com repositórios Prisma)
- [x] Fase 4: domínios financeiros core (transactions, categories, category-groups, contacts, areas)
- [x] Fase 5: domínios de planejamento e relatórios (budget, budget-allocations, settings, reports)
- [x] Fase 6: Prisma schema, migrations e dados (consolidado em apps/api/prisma/)
- [x] Fase 7: cutover Big Bang — remoção completa do legado
- [x] Fase 8: hardening e quality gates
- [ ] Fase 9: governança (docs, PR final) — adiado
- [ ] Passo 10: ambiente local real (DATABASE_URL, NEXT_PUBLIC_USE_API=true) — pré-requisito para Alpha

## Code Surface
- apps/api/src/ — backend NestJS completo
- apps/api/prisma/schema.prisma — schema canônico
- apps/api/prisma/migrations/ — histórico de migrations

## Validation
- pnpm test:unit: 81 arquivos / 324 testes (ok)
- pnpm test:integration: 24 arquivos / 88 testes (ok)
- pnpm lint, type-check, build: ok
- pnpm validate:env development: ok com warnings não bloqueantes
- validate:env production: adiado (pré-requisito de infra — ver tk-100b)

## Definition of Done
- [x] Todos os domínios no padrão DDD com 4 camadas
- [x] Sem imports de NestJS/Prisma no domínio
- [x] Sem acesso a Prisma fora de infrastructure
- [x] Legado removido do runtime
- [x] Envelope HTTP padrão aplicado consistentemente
- [x] Baseline de segurança preservada e validada
- [x] Quality gates obrigatórios aprovados
- [ ] validate:env production (depende de tk-100b)
