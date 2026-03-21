# ============================================
# Stage 1: Build
# ============================================
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files for dependency layer caching
COPY package.json package-lock.json ./

# Install all dependencies (dev included for build tooling)
RUN npm install

# Copy monorepo source
COPY . .

# Build the api-gateway service
RUN npx nx build api-gateway

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
COPY --from=build /app/apps/api-gateway/dist ./

# Install production dependencies only
RUN npm install --omit=dev

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 8080

ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "main.js"]
