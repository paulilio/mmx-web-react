# syntax=docker/dockerfile:1

FROM node:22-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
ENV NODE_ENV=development

# Install only API dependencies
COPY packages/api/package.json ./package.json
RUN --mount=type=cache,id=pnpm-api,target=/pnpm/store \
    pnpm install --include=dev

# Copy API source
COPY packages/api ./

# Build API
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 4000
CMD ["pnpm", "start"]
