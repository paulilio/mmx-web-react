# Checklist de Execucao - Infra Alpha

Data de referencia: 2026-03-12
Status geral: Em andamento

## Resumo da rodada atual

- prisma:generate: ok
- prisma migrate status: erro (5 migracoes pendentes: add_category, add_contact, add_budget, add_area, add_category_group_model)
- validate env development: ok com warnings (NEXT_PUBLIC_USE_API nao esta true, CORS_ORIGINS_DEV vazio)
- validate env production: erro (9 variaveis obrigatorias ausentes: DATABASE_URL, MMX_APP_ENV, CORS_ORIGINS_PROD, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_REDIRECT_URI)

## 1. Preparacao do banco PostgreSQL

- [ ] Escolher provedor free
- [ ] Criar projeto/instancia
- [ ] Obter DATABASE_URL
- [x] Validar conectividade basica (local em localhost:5433 — ok para leitura de status)

## 2. Configuracao de ambiente na Vercel

- [ ] Definir Node.js 22
- [ ] Configurar DATABASE_URL
- [ ] Configurar NEXT_PUBLIC_USE_API=true
- [ ] Configurar MMX_APP_ENV
- [ ] Configurar CORS_ORIGINS_*
- [ ] Configurar GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
- [ ] Configurar MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_REDIRECT_URI, MICROSOFT_TENANT_ID

## 4. Migracoes Prisma

- [x] pnpm prisma:generate
- [ ] Aplicar migracoes no banco de preview (5 pendentes)
- [ ] Validar schema apos migracao
- [ ] Aplicar migracoes no banco de production (quando aprovado)

## 5. Deploy e validacao de ambiente

- [ ] Deploy de preview concluido
- [ ] Deploy de production concluido
- [ ] Health basico das rotas app e API
- [ ] Rotas protegidas retornando 401 AUTH_REQUIRED sem token

## 6. Smoke test funcional P0 (ambiente publicado)

- [ ] Login valido
- [ ] Login invalido (mensagem amigavel)
- [ ] Refresh de sessao
- [ ] Logout
- [ ] CRUD transacoes
- [ ] CRUD categorias/grupos/contatos
- [ ] Budget: add funds, transfer funds, rollover
- [ ] Settings: import, export, clear
