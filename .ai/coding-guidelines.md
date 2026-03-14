# Coding Guidelines

## Code Style
- TypeScript strict-first.
- Double quotes, no semicolons, 2-space indentation.
- Keep changes minimal and composable.

## Naming Conventions
- Files: kebab-case.
- Components/interfaces/types: PascalCase.
- Variables/functions/hooks: camelCase.
- Hooks must start with use.
- Constants: SCREAMING_SNAKE_CASE.

## Frontend Rules
- Keep route pages in app/<feature>/page.tsx.
- Keep reusable UI in components/<feature>/.
- Hooks must not render JSX.
- Data access only through hooks + lib/client/api.ts.

## Backend Rules (apps/api)
- Follow DDD layering per module: presentation, application, domain, infrastructure.
- Keep controllers thin.
- Put business use-cases in application.
- Keep domain framework-agnostic.
- Define repository ports in application and implement in infrastructure.
- Use PrismaService for all database access.

## Validation and Contracts
- DTO validation with class-validator in backend transport layer.
- Keep API envelope as { data, error }.
- Keep date fields in YYYY-MM-DD where contract requires.

## Error Handling
- Use typed errors where possible (for example ApiError).
- Do not expose raw technical details to users.
- No automatic mock fallback in API mode.

## Security Rules
- Preserve JWT access/refresh behavior with rotation/revocation.
- Preserve secure auth cookies and CORS/rate limiting baseline.
- Preserve OAuth state-validation flow.

## Documentation Governance
- Keep README, docs, AGENTS, .github instructions and .ai files synchronized.
- Use docs/documentation-governance-checklist.md for architecture/security/runtime changes.
