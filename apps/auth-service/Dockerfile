# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps

WORKDIR /deps

# Copy root package files for monorepo dependency resolution
COPY package*.json ./
RUN npm install --ignore-scripts

# ============================================
# Stage 2: Build
# ============================================
FROM node:22-alpine AS builder

WORKDIR /build

# Copy root configuration files
COPY tsconfig.base.json nx.json ./

# Copy prisma files
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Copy packages (shared libraries bundled by webpack)
COPY packages ./packages/

# Copy auth-service source
COPY apps/auth-service ./apps/auth-service/

# Copy dependencies from deps stage
COPY --from=deps /deps/node_modules ./node_modules/

# Build auth-service with webpack bundling all packages
RUN npx nx build auth-service --configuration=production

# ============================================
# Stage 3: Production Runtime Dependencies
# ============================================
FROM node:22-alpine AS prod-deps

WORKDIR /prod-deps

# Copy service-level package.json
COPY apps/auth-service/package.json ./

# Install only runtime dependencies
RUN npm install --production --ignore-scripts

# ============================================
# Stage 4: Production Runtime
# ============================================
FROM node:22-alpine

RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy built application (webpack bundles all code including @packages)
COPY --from=builder /build/apps/auth-service/dist ./

# Copy production node_modules (only runtime deps)
COPY --from=prod-deps /prod-deps/node_modules ./node_modules/

# Copy Prisma client runtime for database access
COPY --from=builder /build/node_modules/.prisma ./node_modules/.prisma

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 6001

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:6001/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "main.js"]
