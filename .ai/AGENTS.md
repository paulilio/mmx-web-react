# AGENTS — Manual Operacional para IAs

## Ordem de Leitura
```
1. .ai/AGENTS.md          ← voce esta aqui
2. .ai/SYSTEM.md
3. .ai/CODEBASE_MAP.md
4. .ai/CONTEXT_SURFACES.md
5. Task file (se aplicavel)
```

## Regras Operacionais
- Siga convencoes de naming, estrutura e estilo do repositorio.
- Nao altere components/ui sem solicitacao explicita.
- Prefira mensagens para usuario em portugues.
- Logs e artefatos operacionais devem ser centralizados em runtime/<servico>/.

## Coding Conventions
- TypeScript strict-first.
- Style: double quotes, no semicolons, 2-space indentation.
- Naming:
  - files: kebab-case
  - components/types/interfaces: PascalCase
  - variables/functions/hooks: camelCase
  - constants: SCREAMING_SNAKE_CASE
- Hooks must start with `use` and must not render JSX.
- Keep changes minimal and composable.

## Architecture Rules
- Frontend data boundary: lib/client/api.ts.
- Backend source of truth: apps/api.
- Do not introduce transitional architecture narratives.
- DDD layering per backend module: presentation, application, domain, infrastructure.
- Domain must not depend on NestJS, Prisma, or transport types.
- Controllers remain thin and delegate to use cases.
- Repository ports live in application, implementations live in infrastructure.
- PrismaClient must not be consumed outside infrastructure.

## API Boundary Rules
- apps/api is the official backend for business domains and contracts.
- app/api is limited to local/technical frontend route handlers.
- Do not evolve app/api as a parallel backend.
- UI/hooks must access data via hooks + lib/client/api.ts only.
- Preserve envelope contract: { data, error }.
- In NEXT_PUBLIC_USE_API=true:
  - explicit adapter errors (ApiError, including connectivity status 0)
  - no automatic mock fallback
  - external NEXT_PUBLIC_API_BASE requests must use credentials include

## Security Baseline (Do Not Regress)
- JWT access + refresh tokens.
- Refresh token rotation/revocation.
- Auth cookies with HttpOnly, SameSite, Secure in production.
- Rate limiting.
- CORS by environment.
- OAuth providers: Google and Microsoft.
- Preserve state-validation flow for OAuth.

## Testing Rules
- Stack: Vitest + Testing Library. Playwright for E2E critical flows.
- Unit tests: prioritize pure logic — backend application/domain, security helpers, frontend hooks.
- Integration tests: validate feature flows at service boundary.
  - Frontend: mock lib/client/api.ts boundary.
  - Backend: assert HTTP status, envelope { data, error }, security behavior.
- Backend API tests: prefer testing controllers/use-cases with repository ports mocked.
- E2E priority: auth, transaction CRUD, budget transfer/rollover, reports.
- Naming: *.test.ts / *.test.tsx, behavior-style: should ... when ...
- Prefer co-location when practical.
- Keep tests deterministic and isolated.

## Validation Checklist
Before finalizing any change:
```
pnpm test:unit
pnpm test:integration
pnpm lint
pnpm type-check
pnpm build
pnpm validate:env -- --env=development
```
For release/hardening:
```
pnpm validate:env -- --env=production
```

## Documentation Governance
When changes affect architecture, contracts, security, or runtime:
- Update: README.md, docs/**, .ai/**, .github/copilot-instructions.md, CLAUDE.md
- Use docs/documentation-governance-checklist.md before finalizing.
- Architecture baseline: docs/adr/0012-backend-architecture.md.

## Consistency Rules
- Backend source of truth: apps/api.
- Frontend data boundary: lib/client/api.ts.
- Envelope contract: { data, error }.
- Canonical ADR: docs/adr/0012-backend-architecture.md.

## Pipeline de Comandos (opcional, via .ai/commands/)
```
start-task → task-plan → write-tests → regression-check → task-done → ship
```
