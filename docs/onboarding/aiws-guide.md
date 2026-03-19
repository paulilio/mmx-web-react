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

### Usando o v0 no MMX

1. Abra o projeto no v0
2. Va em **Project → Knowledge → Instructions**
3. Cole o conteudo de `.aiws/references/aiws-custom/custom-v0-instructions.md`

O v0 nao suporta comandos — usar apenas para geracao de UI e componentes frontend.

---

# Validacao obrigatoria antes de finalizar qualquer task

```bash
pnpm test:unit
pnpm test:integration
pnpm lint
pnpm type-check
pnpm build
pnpm validate:env -- --env=development
```

Para release/hardening:
```bash
pnpm validate:env -- --env=production
```

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
```
Leia em ordem:
1. .ai/AGENTS.md
2. .ai/SYSTEM.md
3. .ai/CODEBASE_MAP.md
4. [task atual, se houver]
5. .ai/CONTEXT_SURFACES.md
```
