# Deployment

Este documento descreve o deploy da aplicacao com frontend e backend dedicados.

## Topologia

- frontend: mmx-web-react
- backend: mmx-api
- banco: PostgreSQL

Fluxo:

```text
Browser -> frontend -> backend (REST) -> PostgreSQL
```

## Ambientes

- development
- staging
- production

## Variaveis essenciais (frontend)

- NEXT_PUBLIC_USE_API=true
- NEXT_PUBLIC_API_BASE=<url-do-backend>
- MMX_APP_ENV=development|staging|production

## Variaveis essenciais (backend)

- DATABASE_URL
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- CORS_ORIGINS_DEV
- CORS_ORIGINS_STAGING
- CORS_ORIGINS_PROD
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- MICROSOFT_CLIENT_ID
- MICROSOFT_CLIENT_SECRET
- MICROSOFT_REDIRECT_URI
- MICROSOFT_TENANT_ID

## Regras de deploy

- frontend consome apenas NEXT_PUBLIC_API_BASE
- sem fallback automatico para mock em API mode
- envelope HTTP { data, error } deve ser preservado
- cookies de auth com flags seguras em producao

## Pipeline minimo recomendado

```bash
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:integration
pnpm build
pnpm validate:env -- --env=development
```

Para release/hardening:

```bash
pnpm validate:env -- --env=production
```

## Hardening obrigatorio

- JWT access + refresh
- rotacao/revogacao de refresh
- rate limiting
- CORS por ambiente
- OAuth Google/Microsoft
- security headers

## Referencias

- docs/architecture.md
- docs/api-contracts.md
- docs/docker.md
- docs/adr/0012-backend-architecture.md
