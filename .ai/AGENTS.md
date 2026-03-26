# AGENTS — Manual Operacional para IAs

## Ordem de Leitura
\`\`\`
1. .ai/AGENTS.md          ← voce esta aqui
2. .ai/SYSTEM.md
3. .ai/CODEBASE_MAP.md
4. Task file (se aplicavel)
5. .ai/CONTEXT_SURFACES.md ← avaliar impacto depois de saber o que vai mudar
\`\`\`

## Kernel Unico e Portabilidade Multi-IA
Treat `.ai/` as the single kernel of knowledge, rules, and workflows for this repository.

Operational meaning:
- `.ai/AGENTS.md`, `.ai/SYSTEM.md`, `.ai/CODEBASE_MAP.md`, and `.ai/CONTEXT_SURFACES.md` are the canonical context.
- `.ai/commands/` is the canonical workflow specification layer.
- Bridge files such as `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursorrules`, or equivalent tool entrypoints are pointers to the kernel, not independent sources of truth.
- Do not treat bridge files as the final integration surface for workflows unless the target platform has no native customization mechanism.

Platform integration rule:
- When a platform supports native wrappers such as prompt files, custom agents, skills, hooks, slash commands, or equivalent artifacts, use those artifacts only as platform-specific wrappers.
- Platform-specific wrappers must reference or mirror the kernel intent from `.ai/` and must not replace `.ai/` as the source of truth.
- If a platform does not support native wrappers, use the bridge file or a platform-specific manual prompt as the fallback entrypoint.

Command interpretation rule:
- Treat `.ai/commands/` as workflow specifications, not as a guarantee of native command registration in every AI tool.
- If a tool requires formal registration for commands, prompts, or agents, create tool-native wrappers that map to the corresponding workflow in `.ai/commands/`.

Consistency rule:
- Keep semantic duplication to a minimum.
- Update the kernel first.
- Then update bridges or native wrappers only where required by the target tool.

## Operacao de Ambiente (Alpha)
Para qualquer operacao nos servicos de infraestrutura (GitHub, Vercel, Neon, Railway):
- Leia: `.aiws/knowledge/ops/man-ambiente-alpha.md`
- Contem: metodos de acesso (CLI, API, MCP), identificadores, tokens, comandos testados e diagnostico.

## Regras Operacionais
- Siga convencoes de naming, estrutura e estilo do repositorio.
- Nao altere components/ui sem solicitacao explicita.
- Prefira mensagens para usuario em portugues.
- Logs e artefatos operacionais do software (Docker, API, monitor) devem ser centralizados em runtime/<servico>/ (nao confundir com .aiws/runs/ que e historico de tasks).

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
- When working with `.ts` or `.tsx` files, also read `.ai/rules/typescript.md` for language-specific rules.

## Architecture Rules
- Frontend data boundary: packages/web/lib/client/api.ts.
- Backend source of truth: packages/api.
- Do not introduce transitional architecture narratives.
- DDD layering per backend module: presentation, application, domain, infrastructure.
- Domain must not depend on NestJS, Prisma, or transport types.
- Controllers remain thin and delegate to use cases.
- Repository ports live in application, implementations live in infrastructure.
- PrismaClient must not be consumed outside infrastructure.

## API Boundary Rules
- packages/api is the official backend for business domains and contracts.
- packages/web/app/api is limited to local/technical frontend route handlers.
- Do not evolve packages/web/app/api as a parallel backend.
- UI/hooks must access data via hooks + packages/web/lib/client/api.ts only.
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
\`\`\`
pnpm test:unit
pnpm test:integration
pnpm lint
pnpm type-check
pnpm build
pnpm validate:env -- --env=development
\`\`\`
For release/hardening:
\`\`\`
pnpm validate:env -- --env=production
\`\`\`

## Documentation Governance
When changes affect architecture, contracts, security, or runtime:
- Update: README.md, docs/**, .ai/**, .github/copilot-instructions.md, CLAUDE.md
- Update docs/README.md index when adding or removing documents in docs/.
- Use docs/documentation-governance-checklist.md before finalizing.
- Architecture baseline: docs/adr/0012-backend-architecture.md.

## Consistency Rules
- Backend source of truth: packages/api.
- Frontend data boundary: packages/web/lib/client/api.ts.
- Envelope contract: { data, error }.
- Canonical ADR: docs/adr/0012-backend-architecture.md.

## Workspace Operacional (.aiws/)
Estrutura:
- `tasks/backlog/` — tasks planejadas, ainda nao iniciadas
- `tasks/doing/` — tasks em andamento
- `tasks/done/` — tarefas concluidas
- `knowledge/` — memoria tecnica do projeto (investigacoes, conceitos, padroes, decisoes, reviews)
- `runs/` — historico de execucao de tasks
- `references/` — referencias de produto e mercado
- `templates/` — templates obrigatorios (ver abaixo)

Templates (usar sempre ao criar artefatos):
- Task: `.aiws/templates/task.md` → salvar em `tasks/`
- Investigation: `.aiws/templates/investigation.md` → salvar em `knowledge/inv-*.md`
- Concept: `.aiws/templates/concept.md` → salvar em `knowledge/con-*.md`
- Pattern: `.aiws/templates/pattern.md` → salvar em `knowledge/pat-*.md`
- Decision: `.aiws/templates/decision.md` → salvar em `knowledge/dec-*.md`
- Review: `.aiws/templates/review.md` → salvar em `knowledge/rev-*.md` (sob demanda do usuario)
- Run: `.aiws/templates/run.md` → salvar em `runs/`

## Comandos (.ai/commands/)
Biblioteca de comandos reutilizaveis. Usar como etapas no Plan da task.
Cada task seleciona os comandos aplicaveis — nao ha pipeline fixo.

Comandos disponiveis:
- `task-loop` — loop unico para tasks simples (bugfix, chore). Executa o ciclo completo automaticamente
- `start-task` — ler contexto e entender a task
- `task-plan` — criar/refinar plano de execucao
- `analyze-task` — analise profunda (6 passos) para tasks complexas
- `write-tests` — escrever testes
- `regression-check` — validacao completa (lint, test, type-check, build)
- `task-done` — finalizar task, registrar run, mover para done/, kernel-check se aplicavel
- `ship` — commit, push, PR, gerar descricoes para PR e Jira
- `kernel-check` — verificar se o kernel precisa de atualizacao apos mudancas estruturais
- `spec-review` — revisao arquitetural de spec antes de implementar (10 criterios, risk score)
- `performance-check-custom-mmx` — auditoria de performance focada nos padroes MMX
- `security-check-custom-mmx` — verificacao da security baseline MMX
- `learn` — extrair padroes reutilizaveis da sessao como artefatos de conhecimento (inclui kernel-check + update-docs)
- `checkpoint` — criar/verificar/listar checkpoints nomeados em tasks longas
- `agentic-engineering` — operar com decomposicao por unidades, roteamento de modelos e eval-first
- `update-docs` — verificar e atualizar READMEs, docs/, guides, CODEBASE_MAP e bridges de IA

## Rules Especificas por Linguagem (.ai/rules/)
- `.ai/rules/typescript.md` — regras TypeScript/TSX especificas do MMX (complementam AGENTS.md)

## AI Command Dispatcher
When the user writes a command starting with "/", interpret it as an engineering workflow command.
Format: /command-name [arguments]
Instructions are in: .ai/commands/{command-name}.md
Steps: 1. Read the file. 2. Follow strictly. 3. Execute steps. 4. Output results.

## Wrapper Governance

Platform-specific wrappers exist for each command in `.ai/commands/`:

| Platform | Wrapper location | Format |
|---|---|---|
| Claude Code CLI | `.claude/commands/*.md` | Plain markdown, no frontmatter |
| GitHub Copilot | `.github/prompts/*.prompt.md` | YAML frontmatter + delegation rule |

Rules:
- When creating a new command in `.ai/commands/`, create the corresponding wrapper in BOTH `.claude/commands/` and `.github/prompts/`.
- When editing a command, update the wrapper in both platforms.
- Wrappers must not duplicate content — they must delegate to `.ai/commands/`.
- If a wrapper and the canonical command ever diverge, the canonical command wins.
- Update kernel first, then wrappers.
