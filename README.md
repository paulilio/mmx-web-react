# mmx-web-react

Frontend web do projeto **MMX**, construido com **Next.js + TypeScript**.

O repositorio esta em modo **mock-first com migracao incremental para backend real**.
Atualmente, transacoes ja possuem rotas backend em `app/api/transactions/**`.

---

## Stack

- **Next.js 14.2** (App Router)
- **React 19**
- **TypeScript 5**
- **pnpm**
- **Prisma + PostgreSQL**
- **ESLint + Prettier**
- **Vitest** (testes unitarios)
- (Opcional) **Playwright** (E2E)
- Deploy: **Vercel**

---

## Desenvolvimento local

```bash
corepack enable
pnpm install
pnpm dev
```

Aplicacao local: `http://localhost:3000`

Comandos principais:

```bash
pnpm lint
pnpm type-check
pnpm test:unit
pnpm build
```

---

## Variaveis de ambiente

Crie um `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_USE_API=false
```

- `NEXT_PUBLIC_USE_API=false`: usa modo mock/local
- `NEXT_PUBLIC_USE_API=true`: usa chamadas de API

---

## Documentacao

- Arquitetura geral: `docs/architecture.md`
- Contratos de API: `docs/api-contracts.md`
- Deploy e CI: `docs/deployment.md`
- Desenvolvimento local: `docs/local-development.md`
- Estrutura do projeto: `docs/project-structure.md`
- Diretrizes de frontend: `docs/frontend-guidelines.md`
- ADRs (decisoes arquiteturais): `docs/adr/README.md`
- Mapa explicativo de ADRs: `docs/adr/review.md`

---

## Convencoes

- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- Estilo: TypeScript estrito, sem `any` quando possivel
- UI base: `components/ui/**` (evitar alteracoes sem necessidade)
- Mensagens para usuario: preferencialmente em portugues

---

## Status atual (resumo)

- Fluxo completo em transacoes: `API -> Service -> Domain -> Repository -> Prisma`
- Contrato HTTP padronizado com envelope `{ data, error }`
- Auth backend (bcrypt/JWT), rate limiting e OAuth: em andamento no plano
