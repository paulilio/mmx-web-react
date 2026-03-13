# syntax=docker/dockerfile:1

# ─── Base ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ─── Dependencias ─────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ─── Build ────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Gera o Prisma client no momento do build
RUN pnpm prisma:generate
RUN pnpm build

# ─── Runtime ──────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Usuario nao-root para seguranca
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
# Prisma schema + migrations necessarios para migrate deploy no startup
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Script de startup
COPY --chown=nextjs:nodejs scripts/docker/migrate-and-start.sh ./scripts/docker/migrate-and-start.sh
RUN chmod +x scripts/docker/migrate-and-start.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "scripts/docker/migrate-and-start.sh"]
