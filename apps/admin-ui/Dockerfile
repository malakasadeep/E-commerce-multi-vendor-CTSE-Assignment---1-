# Stage 1: Dependencies
FROM node:22-alpine AS deps

WORKDIR /repo

COPY package*.json ./
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm config set fetch-timeout 600000 \
  && npm install --include=dev --ignore-scripts --no-audit --no-fund --legacy-peer-deps

# Stage 2: Build
FROM node:22-alpine AS builder

WORKDIR /repo

COPY package*.json ./
COPY tsconfig.base.json nx.json ./
COPY apps ./apps
COPY packages ./packages
COPY --from=deps /repo/node_modules ./node_modules/

RUN mkdir -p apps/admin-ui/public && npx nx build admin-ui --configuration=production

# Stage 3: Runtime
FROM node:22-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY --from=deps /repo/node_modules ./node_modules/
COPY --from=builder /repo/dist ./dist
COPY --from=builder /repo/apps/admin-ui/project.json ./apps/admin-ui/project.json
COPY --from=builder /repo/apps/admin-ui/next.config.js ./apps/admin-ui/next.config.js

ENV NODE_ENV=production

EXPOSE 3002

ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "nx", "start", "admin-ui", "--configuration=production"]
