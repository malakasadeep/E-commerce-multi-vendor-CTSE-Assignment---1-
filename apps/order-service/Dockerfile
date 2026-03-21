# ============================================
# Stage 1: Build
# ============================================
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files for dependency layer caching
COPY package.json package-lock.json ./

# Install all dependencies (dev included for build tooling)
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy monorepo source
COPY . .

# Build the order-service
RUN npx nx build order-service

# ============================================
# Stage 2: Production
# ============================================
FROM node:22-alpine

# Install dumb-init for proper PID 1 signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy built output (includes Nx-generated package.json)
COPY --from=build /app/apps/order-service/dist ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy Prisma client runtime (generated engine + client)
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 6003

ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "main.js"]
