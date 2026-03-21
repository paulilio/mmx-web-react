# syntax=docker/dockerfile:1

FROM node:22-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/web/package.json ./packages/web/package.json

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy API source
COPY packages/api ./packages/api

# Generate Prisma client
RUN cd packages/api && ./node_modules/.bin/prisma generate --schema ./prisma/schema.prisma

# Build API
RUN pnpm --filter @mmx/api build

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "packages/api/dist/main"]
