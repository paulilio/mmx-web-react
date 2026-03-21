# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache openssl

# ---- builder stage ----
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

# Copy schema before install so postinstall can find it
COPY packages/api/prisma ./packages/api/prisma

# Install with scripts enabled so Prisma postinstall generates client
RUN pnpm install --frozen-lockfile

COPY packages/api ./packages/api

# Generate Prisma client explicitly
RUN pnpm exec prisma generate --schema packages/api/prisma/schema.prisma

# Build
RUN pnpm --filter @mmx/api build

# Deploy isolated deps for runner (legacy flag required for pnpm v10)
RUN pnpm deploy --filter @mmx/api --prod --legacy /deploy/api

# ---- runner stage ----
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/prisma ./prisma
COPY --from=builder /deploy/api/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main"]
