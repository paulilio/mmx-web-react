# INV: Prisma Client não encontrado no runner Docker (pnpm deploy --prod)

## Problem
Container Railway iniciava e crashava imediatamente com:
```
Error: Cannot find module '.prisma/client/default'
```
O health check do Railway marcava o deploy como falho após 5 minutos de tentativas.

## Symptoms
- Build Docker completava com sucesso (100%)
- `prisma generate` rodava sem erro no builder stage
- Health check: `GET /health` — service unavailable em todas as tentativas
- Runtime log: `Cannot find module '.prisma/client/default'`

## Root Cause
O `prisma generate` gera arquivos nativos em:
```
node_modules/.pnpm/@prisma+client@X.Y.Z_.../node_modules/.prisma/client/
```

O comando `pnpm deploy --filter @mmx/api --prod --legacy /deploy/api` copia apenas
as dependências declaradas no `package.json`. Ele **não copia arquivos gerados**
(outputs de scripts de build/postinstall) — apenas o código-fonte dos pacotes.

Resultado: o diretório `/deploy/api/node_modules/.pnpm/@prisma+client.../node_modules/.prisma/`
chegava vazio ao runner stage, e o `@prisma/client` não conseguia carregar o query engine.

## Fix
Após o `pnpm deploy`, copiar explicitamente o diretório `.prisma` gerado para dentro
do diretório de deploy, antes de passar ao runner stage:

```dockerfile
# Gerar client no builder
RUN pnpm exec prisma generate --schema packages/api/prisma/schema.prisma

# Deploy deps de produção
RUN pnpm deploy --filter @mmx/api --prod --legacy /deploy/api

# Copiar arquivos gerados (não incluídos pelo pnpm deploy)
RUN cp -r /app/node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma \
    /deploy/api/node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma

# Runner stage copia /deploy/api/node_modules — agora inclui .prisma/
COPY --from=builder /deploy/api/node_modules ./node_modules
```

## Notes
- O path do `.prisma` depende da versão exata do `@prisma/client` e do peer `prisma`.
  Ao atualizar versões, atualizar o path no `cp -r` do Dockerfile.
- Versão atual: `@prisma/client@6.19.2` com `prisma@6.19.2` e `typescript@5.9.3`
- Alternativa mais robusta a longo prazo: usar `prisma generate --no-engine` + Prisma Accelerate,
  ou configurar `output` customizado no schema para um path previsível dentro do projeto.
- O mesmo problema ocorreria com qualquer pacote que gere arquivos via postinstall/build
  e que dependa desses arquivos em runtime (ex: sharp, bcrypt nativo).
