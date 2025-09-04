# mmx-web-react

Frontend web do projeto **MMX**, feito com **Next.js + TypeScript**.

CI com **GitHub Actions** e deploy contínuo na **Vercel** (pré-visualizações por PR).

---

## Stack
- **Next.js 14+** (App Router), **React 18**, **TypeScript**
- **pnpm** (gerenciador de pacotes)
- **ESLint + Prettier** (padrões de código)
- **Vitest + Testing Library** (testes unitários)
- (Opcional) **Playwright** (E2E)
- Deploy: **Vercel**

---

## Conectar à Vercel
- No painel da **Vercel**, **Import Git Repository** → selecione `mmx-web-react`.
- Build command: auto (Next), Output: auto.
- Configure as **Environment Variables** (Preview/Production).
- Cada PR vira **Preview**; merge na `main` vai para **Production**.

---

## Convenções
- **Conventional Commits** (`feat:`, `fix:`, `chore:`…)  
- **Husky + lint-staged** (opcional) para rodar `lint`/`test` no commit.
- Labels úteis: `feat`, `bug`, `tech-debt`, `docs`, `blocked`.

---

## Run locally
```bash
corepack enable
pnpm install
pnpm dev