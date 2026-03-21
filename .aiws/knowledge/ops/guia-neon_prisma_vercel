Guia: Neon + Prisma + Vercel para o MMX
Passo 1 — Criar conta e projeto no Neon
Acesse neon.tech e crie uma conta
Crie um novo projeto:
Name: mmx
Region: escolha a mais próxima da região da sua Vercel (ex: us-east-1 ou eu-central-1)
PostgreSQL version: 16
O Neon vai criar automaticamente um branch main
Passo 2 — Obter as connection strings
No dashboard do Neon, vá em Connection Details. Você vai precisar de duas strings:

Pooled (para a aplicação em runtime — usa PgBouncer):

postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
Direct (para Prisma CLI / migrações):

postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
No seu .env local:


DATABASE_URL="postgresql://...pooler...?sslmode=require"
DIRECT_URL="postgresql://...direct...?sslmode=require"
Passo 3 — Atualizar o schema Prisma
Em packages/api/prisma/schema.prisma, adicione directUrl:


datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
directUrl garante que o Prisma CLI (migrate, generate) use conexão direta, enquanto a app usa o pooler.

Passo 4 — Aplicar as migrações

cd packages/api
pnpm prisma migrate deploy
Isso aplica as 5 migrações pendentes no banco Neon.

Passo 5 — Integrar com a Vercel
Duas opções:

Opção A — Integração nativa (recomendado):

No Vercel, vá em Storage → Browse Marketplace → Neon
Conecte ao projeto mmx do Neon
A Vercel configura automaticamente DATABASE_URL nas env vars de preview e production
Branching automático: cada preview deploy ganha um branch isolado do banco
Opção B — Manual:

No Vercel, vá em Project Settings → Environment Variables
Adicione DATABASE_URL (pooled) e DIRECT_URL (direct) para os ambientes Preview e Production
Passo 6 — Validar

pnpm validate:env -- --env=production
DATABASE_URL e DIRECT_URL devem aparecer como válidas. Depois disso a TK-100b Fase A está concluída e você pode avançar para a Fase B (configurar as demais env vars na Vercel).

Sources:

Connect from Prisma to Neon — Neon Docs
Integrating Neon with Vercel — Neon Docs
Neon-Managed Vercel Integration — Neon Docs
Schema migrations with Prisma and Neon — Neon Docs 