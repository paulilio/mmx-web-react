# syntax=docker/dockerfile:1

FROM node:22-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json ./packages/api/package.json

# Install dependencies
RUN pnpm install --filter @mmx/api --frozen-lockfile

# Copy API source
COPY packages/api ./packages/api

# Build API
RUN pnpm --filter @mmx/api build

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "packages/api/dist/main"]
