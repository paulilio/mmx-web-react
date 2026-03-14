# Contratos de API

## Referencia arquitetural

- Backend dedicado: mmx-api (NestJS em apps/api)
- Fronteira frontend: lib/client/api.ts
- ADR normativo: docs/adr/0012-backend-architecture.md

## Envelope padrao

- sucesso: { data: T, error: null }
- falha: { data: null, error: { code, message } }

## Regras de consumo no frontend

- Em NEXT_PUBLIC_USE_API=true, lib/client/api.ts deve:
  - desembrulhar envelope
  - lancar ApiError em erro de envelope/rede
  - nao aplicar fallback automatico para mock
  - usar credentials include para chamadas externas via NEXT_PUBLIC_API_BASE

## Dominios de API

- /auth
- /transactions
- /categories
- /category-groups
- /contacts
- /budget
- /budget-allocations
- /areas
- /settings
- /reports

## Contratos de seguranca

- Endpoints protegidos exigem token de acesso valido.
- Fluxo de refresh deve suportar rotacao e revogacao.
- Cookies de auth com flags seguras em producao.
- Endpoints sensiveis com rate limiting.
- CORS por ambiente.

## Contratos de validacao

- DTOs de transporte validam formato e obrigatoriedade.
- Dominio valida invariantes de negocio.
- Mensagens de erro para usuario devem ser amigaveis.
