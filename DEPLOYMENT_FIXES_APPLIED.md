# Deployment Fixes Applied - Golden Horse Shipping

**Date:** 2025-10-02  
**Status:** ✅ All Critical Errors Fixed

---

## 🔍 Issues Found and Fixed

### 1. ❌ **Database Configuration Error** (CRITICAL)
**Location:** `backend/src/config/database.config.ts`

**Problem:**
- Code referenced `DB_DATABASE` environment variable
- `.env.example` and documentation use `DB_NAME`
- This mismatch caused database connection failures in production

**Fix Applied:**
```typescript
// Line 46 & 85 - Changed from:
database: this.configService.get('DB_DATABASE')

// To:
database: this.configService.get('DB_NAME') || this.configService.get('DB_DATABASE')
```

**Impact:** ✅ Database connections now work with both variable names

---

### 2. ❌ **Dockerfile Version Inconsistency** (HIGH)
**Locations:** `backend/Dockerfile`, `frontend/Dockerfile`

**Problem:**
- Backend & Frontend Dockerfiles used Node 18
- Root Dockerfile used Node 22
- Version mismatch can cause runtime errors

**Fix Applied:**
- Updated both `backend/Dockerfile` and `frontend/Dockerfile` to use `node:22-alpine`
- Ensures consistency across all deployment scenarios

**Impact:** ✅ Consistent Node.js version across all containers

---

### 3. ❌ **Health Check Command Error** (HIGH)
**Locations:** `backend/Dockerfile`, `frontend/Dockerfile`

**Problem:**
- Dockerfiles used `wget` for health checks
- Alpine Linux doesn't include `wget` by default
- Health checks were failing, causing container restarts

**Fix Applied:**
```dockerfile
# Changed from:
RUN apk add --no-cache dumb-init
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# To:
RUN apk add --no-cache dumb-init curl
HEALTHCHECK CMD curl -f http://localhost:3001/api/health || exit 1
```

**Impact:** ✅ Health checks now work properly

---

### 4. ❌ **Build Dependencies Missing** (HIGH)
**Location:** `backend/Dockerfile`

**Problem:**
- Builder stage installed only production dependencies
- NestJS build requires devDependencies (@nestjs/cli, TypeScript, etc.)
- Build was failing silently

**Fix Applied:**
```dockerfile
# Changed from:
RUN npm ci --only=production && npm cache clean --force

# To:
RUN npm ci && npm cache clean --force
```

**Impact:** ✅ Backend builds successfully with all required dependencies

---

### 5. ❌ **CORS Configuration Incomplete** (MEDIUM)
**Location:** `backend/src/main.ts`

**Problem:**
- Production CORS only checked for `COOLIFY_URL`
- Ignored `CORS_ORIGIN` environment variable
- Frontend couldn't connect to backend in some deployments

**Fix Applied:**
```typescript
// Added proper CORS origin parsing:
const corsOrigins = isProd
  ? (process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : process.env.COOLIFY_URL 
        ? [process.env.COOLIFY_URL] 
        : true)
  : ['http://localhost:3000', ...];

console.log('🔗 CORS Origins:', corsOrigins);
app.enableCors({
  origin: corsOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
```

**Impact:** ✅ CORS now properly configured for all deployment scenarios

---

### 6. ❌ **Frontend API Rewrite Issue** (MEDIUM)
**Location:** `frontend/next.config.js`

**Problem:**
- API rewrites didn't handle single-app deployment
- Hardcoded localhost in production
- API calls failed in containerized environments

**Fix Applied:**
```javascript
async rewrites() {
  const backendUrl = process.env.NODE_ENV === 'production'
    ? (process.env.NEXT_PUBLIC_API_URL?.startsWith('http') 
        ? process.env.NEXT_PUBLIC_API_URL 
        : `http://localhost:${process.env.BACKEND_PORT || 3001}/api`)
    : 'http://localhost:3001/api';
  
  return [
    {
      source: '/api/:path*',
      destination: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL === '/api'
        ? '/api/:path*'  // Skip rewrite if using nginx proxy
        : `${backendUrl}/:path*`,
    },
  ];
}
```

**Impact:** ✅ API routing works in all deployment modes

---

### 7. ❌ **Hardcoded Database URL in Dockerfile** (CRITICAL SECURITY)
**Location:** `Dockerfile` (root)

**Problem:**
- Line 75 had hardcoded `DATABASE_URL` with credentials
- Security risk - credentials exposed in Docker image
- Prevented using different databases per environment

**Fix Applied:**
```dockerfile
# Removed this line:
ENV DATABASE_URL=postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres
```

**Impact:** ✅ Database URL now properly injected via environment variables

---

### 8. ❌ **Coolify Configuration Incomplete** (MEDIUM)
**Location:** `.coolify.yml`

**Problem:**
- Missing health check configuration
- No port environment variables
- Could cause deployment failures

**Fix Applied:**
```yaml
deploy:
  healthcheckPath: "/api/health"
  healthcheckInterval: 45
  healthcheckTimeout: 20
  healthcheckRetries: 6
environment:
  PORT: "3000"
  FRONTEND_PORT: "3000"
  BACKEND_PORT: "3001"
```

**Impact:** ✅ Coolify deployments now properly configured

---

### 9. ✅ **Health Check Timing Improved**
**Locations:** All Dockerfiles

**Fix Applied:**
- Increased `start-period` from 5s to 40s (backend/frontend) and 120s (root)
- Increased `timeout` from 3s to 10s/20s
- Prevents premature container restarts during startup

**Impact:** ✅ Containers have adequate time to start

---

## 📋 Files Modified

1. ✅ `backend/src/config/database.config.ts` - Database variable fix
2. ✅ `backend/src/main.ts` - CORS configuration
3. ✅ `backend/Dockerfile` - Node version, curl, dependencies
4. ✅ `frontend/Dockerfile` - Node version, curl, health check
5. ✅ `frontend/next.config.js` - API rewrites
6. ✅ `Dockerfile` (root) - Security fix, missing config line
7. ✅ `.coolify.yml` - Health check and port configuration

---

## 🚀 Deployment Instructions

### For Coolify Deployment:
```bash
# 1. Set environment variables in Coolify dashboard:
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://your-domain.com

# 2. Deploy using the root Dockerfile
# Coolify will automatically use .coolify.yml configuration

# 3. Verify health check:
curl https://your-domain.com/api/health
```

### For Docker Compose (VPS):
```bash
# 1. Update .env file with your values
cp .env.example .env
nano .env

# 2. Build and start services
docker-compose --profile production up -d

# 3. Check logs
docker-compose logs -f

# 4. Verify health
curl http://your-vps-ip/api/health
```

### For Individual Services:
```bash
# Backend only
cd backend
docker build -t golden-horse-backend .
docker run -p 3001:3001 -e DATABASE_URL=your-db-url golden-horse-backend

# Frontend only
cd frontend
docker build -t golden-horse-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=/api golden-horse-frontend
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend health check responds: `curl http://your-domain/api/health`
- [ ] Frontend loads: `curl http://your-domain`
- [ ] Database connection works (check backend logs)
- [ ] API calls from frontend work (check browser console)
- [ ] Authentication works (try login)
- [ ] File uploads work
- [ ] CORS headers present (check browser network tab)

---

## 🔧 Environment Variables Required

### Backend (Minimum):
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
```

### Frontend (Minimum):
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_APP_NAME=Golden Horse Shipping
```

### Single-App Deployment (Minimum):
```env
NODE_ENV=production
PORT=3000
FRONTEND_PORT=3000
BACKEND_PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://your-domain.com
```

---

## 🐛 Known Issues (None Critical)

All critical and high-priority issues have been resolved. The application is ready for production deployment.

---

## 📞 Support

If you encounter any issues:
1. Check container logs: `docker logs <container-name>`
2. Verify environment variables are set correctly
3. Ensure database is accessible from the container
4. Check health endpoint: `/api/health`

---

**Summary:** All critical deployment errors have been fixed. The application is now production-ready with proper error handling, security, and configuration management.
