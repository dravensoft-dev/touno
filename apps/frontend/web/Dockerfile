FROM node:24-bookworm-slim AS base
COPY --from=oven/bun:1.3.14 /usr/local/bin/bun /usr/local/bin/bun
RUN mkdir -p /touno && chown node:node /touno
WORKDIR /touno
USER node

FROM base AS deps
COPY --chown=node:node package.json bun.lock ./
COPY --chown=node:node apps/frontend/web/package.json apps/frontend/web/package.json
RUN bun install --frozen-lockfile

FROM deps AS dev
COPY --chown=node:node . .
RUN mkdir -p node_modules apps/frontend/web/node_modules
EXPOSE 4200
CMD ["bun", "run", "--filter", "@touno/web", "start"]

FROM deps AS build
COPY --chown=node:node . .
RUN bun run --filter @touno/web build

FROM nginx:1.29-alpine AS serve
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /touno/apps/frontend/web/dist/touno/browser /usr/share/nginx/html
EXPOSE 4173
