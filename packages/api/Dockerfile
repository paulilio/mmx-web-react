# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache openssl

# ---- deps stage ----
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

RUN pnpm install --frozen-lockfile --ignore-scripts

# Deploy only api deps into isolated folder (fixes pnpm symlink issues)
RUN pnpm deploy --filter @mmx/api --prod /deploy/api

# ---- build stage ----
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY packages/api ./packages/api

# Generate Prisma client
RUN pnpm exec prisma generate --schema packages/api/prisma/schema.prisma

# Build
RUN pnpm --filter @mmx/api build

# ---- runner stage ----
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/prisma ./prisma
COPY --from=deps /deploy/api/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main"]
