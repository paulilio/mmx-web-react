# TK-101 - Refatoracao Definitiva Backend (NestJS + Prisma)

## 0) Decisao arquitetural final (obrigatoria)

Este backend sera refatorado em corte unico (Big Bang), sem compatibilidade com legado.

- Arquitetura: Modular Monolith
- Design: Domain-Driven Design (DDD)
- Framework: NestJS
- ORM: Prisma
- Banco: PostgreSQL
- Runtime: Node 22
- Package manager: pnpm
- Container: Docker

Regras obrigatorias:
- Cada dominio e um bounded context.
- Dominio e puro: sem imports de NestJS, Prisma ou Express.
- Casos de uso ficam em application.
- Controllers sao apenas adaptadores HTTP.
- Persistencia Prisma fica somente em infrastructure.
- Integracao entre contextos via contracts/events, nunca por acesso direto a repositorio de outro modulo.

## 2) Execucao definitiva (Big Bang, sem legado)

Objetivo: substituir toda a arquitetura antiga em uma unica entrega.

Passo 1 - Criar nova base DDD completa
Passo 2 - Migrar toda regra de negocio para application/domain
Passo 3 - Reescrever persistencia em Prisma (infra)
Passo 4 - Reescrever camada HTTP
Passo 5 - Preservar seguranca sem regressao
Passo 6 - Remover arquitetura antiga no mesmo corte
Passo 7 - Validacao final obrigatoria

## 6) Checklist de conformidade final

Arquitetura e DDD:
- Modular Monolith implantado por bounded contexts
- Camadas presentation/application/domain/infrastructure em todos os modulos
- Dominio sem dependencias de framework/ORM
- Ports de repositorio em application, implementacoes em infrastructure
- Sem acoplamento cruzado de repositorios entre modulos

Seguranca:
- JWT access + refresh preservado
- Rotacao e revogacao de refresh token
- Cookies seguros (HttpOnly, SameSite, Secure em prod)
- Rate limiting, CORS, OAuth Google + Microsoft

Operacao:
- Docker build executavel
- Health/readiness operacional
- Build e testes passando
