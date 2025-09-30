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

# Create startup script inline
RUN echo '#!/bin/bash\n\
echo "Starting Golden Horse Shipping Application..."\n\
echo "Starting Backend on port ${BACKEND_PORT:-3001}..."\n\
cd /app/backend && PORT=${BACKEND_PORT:-3001} node dist/main.js &\n\
BACKEND_PID=$!\n\
sleep 5\n\
echo "Starting Frontend on port ${FRONTEND_PORT:-3000}..."\n\
cd /app/frontend && PORT=${FRONTEND_PORT:-3000} npm start &\n\
FRONTEND_PID=$!\n\
shutdown() {\n\
    echo "Shutting down services..."\n\
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null\n\
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null\n\
    exit 0\n\
}\n\
trap shutdown SIGTERM SIGINT\n\
echo "Both services started successfully!"\n\
echo "Frontend: http://localhost:${FRONTEND_PORT:-3000}"\n\
echo "Backend API: http://localhost:${BACKEND_PORT:-3001}/api"\n\
wait $BACKEND_PID $FRONTEND_PID' > /app/start.sh && \
    chmod +x /app/start.sh && chown nextjs:nodejs /app/start.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV FRONTEND_PORT=3000
ENV BACKEND_PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); const options = { hostname: 'localhost', port: process.env.BACKEND_PORT || 3001, path: '/api/health', timeout: 5000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Set entrypoint and command
ENTRYPOINT ["dumb-init", "--"]
CMD ["./start.sh"]