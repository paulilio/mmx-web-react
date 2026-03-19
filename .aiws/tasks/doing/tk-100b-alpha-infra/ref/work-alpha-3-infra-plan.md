# Etapa 3 - Infra para Alpha

Data de referencia: 2026-03-12
Camada: Operacional
Origem: Etapa 3 do roadmap Alpha

## 1. Objetivo

Disponibilizar o sistema para testes Alpha externos com baseline minima de confiabilidade operacional.

Definicao pratica:
- Vercel free configurada
- banco PostgreSQL ativo
- app conectada ao banco
- seguranca baseline preservada
- smoke test funcional validado

## 3. Arquitetura alvo para Alpha

Topologia minima:
1. Front + first-party API no mesmo projeto Next.js na Vercel
2. Banco PostgreSQL externo gerenciado
3. Cookie-based auth com rotas /api/auth/*
4. CORS por ambiente conforme MMX_APP_ENV

## 4. Guardrails obrigatorios

1. Node 22 na Vercel (alinhado ao package.json).
2. NEXT_PUBLIC_USE_API=true no ambiente Alpha.
3. Nao introduzir fallback automatico para mock em falha de conectividade.
4. Preservar credentials: "include" para chamadas externas quando houver NEXT_PUBLIC_API_BASE.
5. Manter seguranca existente (cookies HttpOnly, headers, middleware gate).

## 5. Plano de execucao

### Fase A - Preparacao
1. Escolher provedor PostgreSQL free (ex.: Neon/Supabase/Render).
2. Criar instancia e obter DATABASE_URL.
3. Conferir se a instancia aceita conexoes do runtime da Vercel.

### Fase B - Configuracao Vercel
1. Configurar Node.js 22 no projeto.
2. Configurar env vars em Preview e Production.
3. Fazer primeiro deploy de preview e validar build.

### Fase C - Banco e migracoes
1. Executar pnpm prisma:generate.
2. Aplicar migracoes no banco alvo.
3. Validar que tabelas e indices esperados existem.

### Fase D - Validacao funcional Alpha
1. Rodar gates tecnicos no repositorio.
2. Rodar validacao de env.
3. Executar smoke funcional em ambiente publicado.

## 6. Riscos e mitigacoes

1. Variavel de ambiente incompleta causando falha em runtime.
2. CORS/origens incorretas bloqueando auth e chamadas API.
3. Falha de migracao por diferenca de schema/estado do banco.
4. OAuth com redirect URI divergente do dominio publicado.

## 7. Criterio de saida da Etapa 3

1. URL de preview e URL de production disponiveis.
2. Banco PostgreSQL conectado e migrado.
3. Gates tecnicos e de env sem falha critica.
4. Smoke P0 concluido sem bloqueador.
5. Riscos residuais registrados com plano de tratamento.
