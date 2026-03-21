# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps

WORKDIR /deps

COPY package*.json ./
RUN npm install --ignore-scripts

# ============================================
# Stage 2: Build
# ============================================
FROM node:22-alpine AS builder

WORKDIR /build

COPY tsconfig.base.json nx.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY packages ./packages/
COPY apps/payment-service ./apps/payment-service/
COPY --from=deps /deps/node_modules ./node_modules/

RUN npx nx build payment-service --configuration=production

# ============================================
# Stage 3: Production Runtime Dependencies
# ============================================
FROM node:22-alpine AS prod-deps

WORKDIR /prod-deps

COPY apps/payment-service/package.json ./
RUN npm install --production --ignore-scripts

# ============================================
# Stage 4: Production Runtime
# ============================================
FROM node:22-alpine

RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

COPY --from=builder /build/apps/payment-service/dist ./
COPY --from=prod-deps /prod-deps/node_modules ./node_modules/
COPY --from=builder /build/node_modules/.prisma ./node_modules/.prisma

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 6004
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:6004/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "main.js"]
