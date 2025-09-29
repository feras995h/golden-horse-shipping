# Production-optimized Dockerfile for Golden Horse Shipping
FROM node:22-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat curl dumb-init

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies with optimizations
RUN npm ci --only=production --no-audit --no-fund && \
    cd backend && npm ci --only=production --no-audit --no-fund && \
    cd ../frontend && npm install --only=production --no-audit --no-fund

# Development dependencies stage
FROM base AS deps
WORKDIR /app
RUN npm ci --no-audit --no-fund && \
    cd backend && npm ci --no-audit --no-fund && \
    cd ../frontend && npm install --no-audit --no-fund

# Build stage
FROM deps AS builder
WORKDIR /app

# Copy source code
COPY . .

# Build applications
RUN cd backend && npm run build && \
    cd ../frontend && npm run build

# Production stage
FROM node:22-alpine AS production

# Install system dependencies
RUN apk add --no-cache libc6-compat curl dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/backend/node_modules ./backend/node_modules
COPY --from=base /app/frontend/node_modules ./frontend/node_modules

# Copy built applications
COPY --from=builder --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nextjs:nodejs /app/backend/package.json ./backend/
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next ./frontend/.next
COPY --from=builder --chown=nextjs:nodejs /app/frontend/package.json ./frontend/
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/next.config.js ./frontend/

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@r8ks0cwc8wk0w8swsggs4wg0:5432/postgres

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/dist/main.js"]