FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY lib ./lib
COPY artifacts/api-server/package.json ./artifacts/api-server/package.json
COPY artifacts/xf-store/package.json ./artifacts/xf-store/package.json

RUN pnpm install --frozen-lockfile=false

COPY . .

RUN pnpm --filter @workspace/xf-store run build
RUN pnpm --filter @workspace/api-server run build

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "artifacts/api-server/dist/index.mjs"]
