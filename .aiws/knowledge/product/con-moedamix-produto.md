# CON: MoedaMix — Produto e Contexto

## What
MoedaMix é uma plataforma web de gestão financeira para pequenas operações e profissionais que precisam controlar transações, orçamento, contatos e fluxo de caixa com segurança e clareza.

## How It Works
O produto foi inspirado no app QuickBooks ZeroPaper (descontinuado), especialmente no controle de contas a pagar e receber com visão de previsão de receita/despesa. O usuário faz lançamentos pontuais e previstos e visualiza se terá lucro ou prejuízo — base para tomada de decisão.

A interface foi construída inicialmente com v0 (Vercel) usando dados em JSON para testes. O backend foi desenvolvido com Copilot usando NestJS + Prisma + DDD.

## Why It Matters
Define o escopo e as prioridades de desenvolvimento. Toda feature deve ser avaliada contra o stage atual do produto:

- Stage atual: **Alpha**
- Critério de entrada Alpha: base de autenticação/segurança consolidada, domínios principais operacionais em first-party API
- Critério de saída Alpha: backlog de lacunas executando, cobertura de testes e UX em nível aceitável para ampliar exposição

## Where in the Codebase
- packages/api/src/modules/ — domínios de negócio (transactions, budget, categories, contacts, areas, reports, settings)
- packages/web/app/ — frontend Next.js
- packages/web/hooks/ — acesso a dados do frontend
- packages/web/lib/client/api.ts — boundary de dados frontend

## Notes
Top 3 objetivos do ciclo Alpha:
1. Fechar lacunas de funcionalidades essenciais (Fase 2)
2. Elevar qualidade e experiência (Fase 3)
3. Preparar base de operação para release (Fase 4)

Riscos principais:
- Expandir features sem concluir lacunas críticas de fase ativa
- Avançar sem cobertura E2E suficiente
- Adiar CI/CD e observabilidade compromete confiança de release
