# História de Criação — MoedaMix

## Origem

O MoedaMix nasceu da necessidade de substituir o **QuickBooks ZeroPaper**, app de controle financeiro descontinuado pela Intuit em 2023. O ZeroPaper era usado para controle financeiro pessoal — especialmente o módulo de contas a pagar e receber, que permitia lançamentos pontuais e previstos para antecipar lucro ou prejuízo.

A proposta do MoedaMix é replicar e aprimorar essa experiência em um sistema moderno.

---

## Fases de Desenvolvimento

### Fase 1 — Interface com v0 (Vercel)
A interface foi construída com o **v0**, usando dados armazenados em arquivos JSON para testes. Foram criados mecanismos para carregar dados fictícios, limpar e baixar modelos — tudo para viabilizar testes e correção de bugs sem backend real.

### Fase 2 — Backend com Copilot
A construção do backend foi feita com o **GitHub Copilot**. O fluxo de trabalho seguia um pipeline estruturado:

```
1-definitions → 2-roadmap → tasks (work-main / work-alpha)
```

- **work-main** — execução do roadmap principal (fases 1 a 5)
- **work-alpha** — versão simplificada criada quando o main ficou complexo demais; objetivo era ter um protótipo funcional para testes antes de continuar o main
- **tsk/** — tasks de reorganização do projeto; resultado principal: backend migrado para `apps/api` com arquitetura DDD (NestJS + Prisma)

### Fase 3 — Estrutura AIWS com Claude
A continuidade do projeto migrou para o **Claude Code**, com adoção do modelo **AI Engineering Workspace (AIWS)**. Todo o histórico do `.dev-workspace` foi consolidado na nova estrutura `.aiws/`, preparando a base para o ciclo Alpha.

---

## Estado Atual

- Backend: `apps/api` — NestJS + Prisma + DDD (Modular Monolith)
- Frontend: `app/` — Next.js, conectado ao backend via `lib/client/api.ts`
- Stage: **Alpha** — backend validado, infra pendente, lacunas de feature em backlog
- Workspace operacional: `.aiws/` com tasks, knowledge e references organizados
