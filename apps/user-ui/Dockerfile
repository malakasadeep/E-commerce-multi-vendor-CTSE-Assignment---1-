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

ARG NEXT_PUBLIC_API_BASE_URL=http://zudox.online
ARG NEXT_PUBLIC_API_URL=http://zudox.online
ARG NEXT_PUBLIC_SELLER_URL=http://localhost:3001
ARG NEXT_PUBLIC_ADMIN_URL=http://localhost:3002
ARG NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
ARG NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SELLER_URL=${NEXT_PUBLIC_SELLER_URL}
ENV NEXT_PUBLIC_ADMIN_URL=${NEXT_PUBLIC_ADMIN_URL}
ENV NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=${NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
ENV NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=${NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}

WORKDIR /repo

COPY package*.json ./
COPY tsconfig.base.json nx.json ./
COPY apps ./apps
COPY packages ./packages
COPY --from=deps /repo/node_modules ./node_modules/

RUN mkdir -p apps/user-ui/public && npx nx build user-ui --configuration=production

# Stage 3: Runtime
FROM node:22-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY package*.json ./
COPY --from=deps /repo/node_modules ./node_modules/
COPY --from=builder /repo/dist/apps/user-ui .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
