# Visao Geral do Sistema (Onboarding Tecnico)

Este e o ponto de entrada para onboarding tecnico do MMX. Aqui voce encontra contexto de produto, arquitetura, modulos principais, fluxo de dados e modelo de deploy.

---

## Inicio Rapido

Rode localmente em menos de 2 minutos:

```bash
pnpm install
pnpm dev
```

Abrir: `http://localhost:3000`

---

## Proposito do MMX

MMX e uma aplicacao web de financas pessoais para controle de transacoes, categorias, contatos, orcamento e relatorios. O foco e operacao diaria com UX simples, mantendo evolucao incremental de mock-first para backend real sem quebrar a UI.

Escopo funcional atual:
- autenticacao (login, refresh, logout, OAuth)
- dashboard e relatorios
- transacoes e recorrencias
- categorias e grupos de categorias
- contatos
- orcamento e alocacoes
- settings (import, export, clear)

---

## Arquitetura

Stack principal:
- Next.js 14 (App Router)
- React 19 + TypeScript 5
- Prisma + PostgreSQL
- SWR + React Hook Form + Zod

Arquitetura em camadas:
- cliente: `app/**` -> `components/**` -> `hooks/**` -> `lib/client/api.ts`
- servidor: `app/api/**` -> `lib/server/services/**` -> `lib/domain/**` -> `lib/server/repositories/**` -> Prisma

Principios atuais:
- modular monolith (sem microservicos por enquanto)
- contrato HTTP padrao com envelope `{ data, error }`
- fronteira de dados no cliente concentrada em `lib/client/api.ts`
- preocupacoes de seguranca centralizadas em `lib/server/security/**` e `middleware.ts`
- composition root backend centralizado em `lib/server/services/index.ts` para dependencias de `app/api/**`

Diagrama simplificado:

```text
Frontend (React)
	|
	v
Next.js API routes
	|
	v
Services
	|
	v
Domain
	|
	v
Repositories
	|
	v
Prisma
	|
	v
PostgreSQL
```

---

## Modulos principais

Modulos e responsabilidades:
- Auth: sessao, refresh token, OAuth, guardas de rota
- Transactions: CRUD e regras de negocio de lancamentos
- Categories / Category Groups (categorias e grupos de categorias): organizacao de classificacao financeira
- Contacts: entidades de relacionamento por transacao
- Budget / Budget Allocations: planejamento e distribuicao de valores
- Reports: summary, aging, cashflow
- Settings Maintenance (manutencao de configuracoes): import/export/clear de dados

Pastas chave:
- UI e rotas: `app/**`, `components/**`
- Logica de dominio no cliente: `hooks/**`
- API client boundary: `lib/client/api.ts`
- API server e regras: `app/api/**`, `lib/server/**`, `lib/domain/**`
- Persistencia: `lib/server/repositories/**`, `prisma/**`

Visao rapida da estrutura principal:

```text
app/
components/
hooks/
lib/
	domain/
	server/
		services/
		repositories/
prisma/

docs/
docker/
scripts/
```

---

## Fluxo de dados

Fluxo padrao da interface ate a persistencia:
1. Pagina em `app/**` renderiza componente.
2. Componente chama hook de dominio em `hooks/**`.
3. Hook acessa `lib/client/api.ts`.
4. O adaptador decide rota de primeira parte (`/api/*`) ou base externa (`NEXT_PUBLIC_API_BASE`) conforme configuracao.
5. Rotas em `app/api/**` delegam para services via composition root (`lib/server/services/index.ts`).
6. Repositories acessam Prisma/PostgreSQL.
7. Resposta volta no envelope `{ data, error }` para o hook e re-renderiza UI.

Observacoes importantes:
- isolamento multiusuario por `userId`
- em `NEXT_PUBLIC_USE_API=true`, sem fallback automatico para mock em erro de conectividade
- chamadas externas usam `credentials: "include"` para auth baseada em cookie
- em `app/api/**/route.ts`, guardrails de lint bloqueiam import direto de `repositories/prisma`

---

## Modelo de deploy

Modelos de execucao:

1. Desenvolvimento sem Docker
- `pnpm dev`
- env local em `.env.local`

2. Desenvolvimento com Docker
- stack `mmx-dev` (compose nomeado)
- comandos: `pnpm docker:dev:up`, `pnpm docker:dev:logs`, `pnpm docker:dev:down`

3. Producao com Docker (self-hosted)
- stack `mmx-prod` (compose nomeado)
- comandos: `pnpm docker:prod:up`, `pnpm docker:prod:logs`, `pnpm docker:prod:down`

4. Producao em plataforma gerenciada
- deploy principal em Vercel
- variaveis por ambiente no painel da plataforma

---

## Estrategia de testes

Como testamos o projeto:
- Testes unitarios: Vitest
- Testes de integracao: Vitest + API routes + middleware
- E2E (opcional): Playwright

Comandos principais:

```bash
pnpm test:unit
pnpm test:integration
```

Referencias detalhadas:
- arquitetura: `docs/architecture.md`
- estrutura de pastas: `docs/project-structure.md`
- deploy e CI: `docs/deployment.md`
- operacao Docker: `docs/docker.md`
