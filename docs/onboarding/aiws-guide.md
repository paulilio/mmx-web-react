# MMX Workspace Guide

Guia de uso do workspace especifico para o projeto MMX.
Para o modelo generico, veja: `references/aiws/generic-guide-ops.md`
Para os principios do modelo, veja: `references/aiws/generic-blueprint.md`

---

# Ferramentas de AI no MMX

| Ferramenta | Como ativa o kernel | Modo |
|---|---|---|
| Claude Code | Le `CLAUDE.md` (raiz) automaticamente | Automatico |
| GitHub Copilot | Le `.github/copilot-instructions.md` | Automatico |
| Cursor | Le `.cursorrules` (raiz) | Automatico |
| v0 (Vercel) | Colar `aiws-custom-v0-instructions.md` em Project → Knowledge | Manual |

## Modelo multi-IA no MMX

No MMX, a divisao correta de responsabilidades e:

- `.ai/` e o kernel unico de conhecimento, regras e workflows.
- `.ai/commands/` e a especificacao canonica dos workflows operacionais.
- `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursorrules` e equivalentes sao arquivos-bridge. Eles ativam ou apontam para o kernel, mas nao substituem o kernel.
- Wrappers nativos por ferramenta entram apenas quando a plataforma exige integracao formal. Exemplo: prompt files, custom agents, skills ou outros artefatos registrados pelo Copilot.

Regra pratica:

1. Mude primeiro o kernel.
2. Depois ajuste a bridge, se necessario.
3. So entao ajuste wrappers nativos da ferramenta que precisar.

### Quando criar wrapper nativo

Crie wrapper nativo quando a ferramenta nao conseguir usar o workflow apenas lendo a bridge e o kernel.

Exemplos:

- Copilot: criar prompt files, agents ou skills quando precisar de slash commands nativos ou integracao formal.
- Claude/Cursor: usar artefatos nativos da plataforma apenas se o bridge nao for suficiente.
- v0 ou chats manuais: usar prompt manual especifico quando nao houver mecanismo automatico.

### Quando alterar `.ai/commands`

Sempre trate `.ai/commands/` como a fonte canonica do workflow.
Nao trate esse diretorio como garantia de execucao nativa em toda ferramenta.
Se um comando precisar aparecer de forma nativa em uma plataforma, crie o wrapper correspondente apontando para o workflow canonico.

### Usando o v0 no MMX

1. Abra o projeto no v0
2. Va em **Project → Knowledge → Instructions**
3. Cole o conteudo de `.aiws/references/aiws-custom/custom-v0-instructions.md`

O v0 nao suporta comandos — usar apenas para geracao de UI e componentes frontend.

---

# Validacao obrigatoria antes de finalizar qualquer task

\`\`\`bash
pnpm test:unit
pnpm test:integration
pnpm lint
pnpm type-check
pnpm build
pnpm validate:env -- --env=development
\`\`\`

Para release/hardening:
\`\`\`bash
pnpm validate:env -- --env=production
\`\`\`

---

# Fronteiras arquiteturais (nao cruzar)

- Frontend acessa backend APENAS via `lib/client/api.ts`
- `app/api/` e restrito a handlers tecnicos de frontend — nao evoluir como backend paralelo
- `apps/api` e o backend oficial para dominios de negocio
- Envelope contract: todas as respostas seguem `{ data, error }`
- Domain nao depende de NestJS, Prisma ou tipos de transporte

---

# Modulos do MMX (referencia rapida)

| Modulo | Proposito |
|---|---|
| Auth | Autenticacao, sessao, OAuth Google/Microsoft |
| Transactions | CRUD de transacoes financeiras |
| Categories / Category Groups | Categorizacao de transacoes |
| Contacts | Clientes e fornecedores |
| Budget / Budget Allocations | Orcamento e alocacoes |
| Areas | Centros de custo |
| Reports | Resumo, aging, cashflow |
| Settings | Configuracoes de usuario |

---

# Onboarding no MMX

Para um humano novo no projeto:
1. `.ai/SYSTEM.md` — entenda o que o sistema faz
2. `.ai/CODEBASE_MAP.md` — entenda onde esta cada parte
3. `docs/README.md` — documentacao tecnica detalhada
4. Este documento — como trabalhar com AI no MMX

Para uma AI nova (qualquer ferramenta):
\`\`\`
Leia em ordem:
1. .ai/AGENTS.md
2. .ai/SYSTEM.md
3. .ai/CODEBASE_MAP.md
4. [task atual, se houver]
5. .ai/CONTEXT_SURFACES.md
\`\`\`
