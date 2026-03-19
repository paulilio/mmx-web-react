# DEC: Backend Dedicado — NestJS + Prisma + DDD (Modular Monolith)

## Decision
Migrar o backend de first-party API dentro do Next.js (packages/web/app/api/) para backend dedicado em packages/api com NestJS + Prisma + DDD em corte único (Big Bang), sem coexistência com arquitetura legada.

## Context
O backend original era uma coleção de route handlers em packages/web/app/api/ sem separação arquitetural real. Com o crescimento do produto e a necessidade de testes, segurança e escalabilidade, foi necessário um backend com arquitetura clara e testável.

## Options Considered
- Opção A: Evolução incremental do first-party API (manter em packages/web/app/api/ e adicionar camadas gradualmente)
- Opção B: Big Bang — substituição completa em corte único para packages/api com NestJS + DDD
- Opção C: Microserviços (descartado pela complexidade operacional no estágio atual)

## Rationale
Big Bang foi escolhido para evitar coexistência de dois padrões arquiteturais, que geraria ambiguidade sobre qual usar e dificultaria testes. A decisão de NestJS + DDD permite bounded contexts claros, testabilidade por camada e base sólida para evolução.

Regras inegociáveis:
- Cada domínio é um bounded context com 4 camadas: presentation, application, domain, infrastructure
- Domain puro: sem imports de NestJS, Prisma ou Express
- Repository ports em application, implementações Prisma em infrastructure
- PrismaClient apenas em infrastructure
- Controllers finos, delegando para use-cases/services

## Impact
- packages/api é o backend oficial para todos os domínios de negócio
- packages/web/app/api limitado a route handlers locais/técnicos do frontend
- UI e hooks acessam dados SOMENTE via packages/web/lib/client/api.ts
- Envelope HTTP obrigatório: { data, error }
- Baseline de segurança preservada: JWT, refresh rotation, cookies HttpOnly, rate limit, CORS, OAuth Google/Microsoft

Domínios cobertos: health, auth, transactions, categories, category-groups, contacts, areas, budget, budget-allocations, settings, reports
