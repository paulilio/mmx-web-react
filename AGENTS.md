# AGENTS

Use este arquivo como ponto de entrada para agentes de IA neste repositorio.

## Ordem obrigatoria de leitura
1. .github/copilot-instructions.md
2. .ai/project-context.md
3. .ai/architecture.md
4. .ai/coding-guidelines.md
5. .ai/testing-guidelines.md
6. .ai/repo-map.md
7. .ai/documentation-governance.md

## Regras operacionais
- Siga convencoes de naming, estrutura e estilo do repositorio.
- Nao altere components/ui sem solicitacao explicita.
- Prefira mensagens para usuario em portugues.

## Direcao arquitetural obrigatoria
- Frontend dedicado: mmx-web-react.
- Backend dedicado: mmx-api em apps/api.
- Arquitetura backend: Modular Monolith + DDD + NestJS + Prisma.
- ADR normativo: docs/adr/0012-backend-architecture.md.

## Fronteira de dados frontend
- UI e hooks devem consumir dados apenas via lib/client/api.ts.
- Nao criar camada paralela de cliente HTTP.
- Nao acessar persistencia diretamente em paginas/componentes.

## Regras backend (apps/api)
- Bounded contexts em src/modules.
- Camadas por contexto: presentation, application, domain, infrastructure.
- Domain nao depende de NestJS/Prisma.
- Use-cases dependem de ports.
- Implementacoes de repositorio ficam em infrastructure e usam PrismaService.

## Seguranca baseline
- JWT access + refresh.
- Rotacao e revogacao de refresh token.
- Cookies HttpOnly/SameSite/Secure em producao.
- Rate limiting.
- CORS.
- OAuth Google e Microsoft.

## Validacao antes de finalizar
- pnpm test:unit
- pnpm test:integration
- pnpm lint
- pnpm type-check
- pnpm build
- pnpm validate:env -- --env=development

Para hardening/release:
- pnpm validate:env -- --env=production
