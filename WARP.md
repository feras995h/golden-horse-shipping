# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Monorepo containing:
  - backend: NestJS (TypeScript) REST API with TypeORM, JWT auth (admin and customer flows), PostgreSQL, optional Redis, Swagger, and file uploads.
  - frontend: Next.js (TypeScript, Tailwind) with i18n (next-i18next), admin and customer portals, and API routes that proxy to the backend for server-side operations.
- Containerization: docker-compose orchestrates postgres, backend, frontend, and optional nginx. A single-app image is provided by the root Dockerfile to run both backend and frontend in one container.
- Default local ports: frontend 3000, backend 3001. Backend health: GET /api/health.

Prerequisites
- Node.js >= 18 (enforced by engines field).
- PostgreSQL (local or cloud). For local dev without Docker, configure backend .env; for Docker, use compose environment.

Environment configuration
- Backend: create backend/.env with DB connection and JWT settings (see README for full list). DATABASE_URL is supported. Key values: JWT_SECRET, FRONTEND_URL, DB_* (or DATABASE_URL), optional Redis.
- Frontend: create frontend/.env.local with NEXT_PUBLIC_API_URL (e.g., http://localhost:3001) and NEXTAUTH_SECRET if used.

Install dependencies
- Backend
  ```bash path=null start=null
  npm install --prefix backend
  ```
- Frontend
  ```bash path=null start=null
  npm install --prefix frontend
  ```

Run in development
- Start both apps concurrently from the repo root (uses concurrently)
  ```bash path=null start=null
  npm run dev
  ```
- Or run separately
  ```bash path=null start=null
  # Backend (watch mode)
  npm run start:dev --prefix backend

  # Frontend
  npm run dev --prefix frontend
  ```

Build
- Build both apps from the repo root
  ```bash path=null start=null
  npm run build
  ```
- Individual builds
  ```bash path=null start=null
  npm run build --prefix backend
  npm run build --prefix frontend
  ```

Start (production-like, after build)
- Backend only (uses dist)
  ```bash path=null start=null
  npm run start:prod --prefix backend
  ```
- Frontend only
  ```bash path=null start=null
  npm start --prefix frontend
  ```
- Root start scripts (start/start:prod) invoke backend only; use the frontend command above to serve the Next.js app.

Lint and type-check
- Backend (ESLint)
  ```bash path=null start=null
  npm run lint --prefix backend
  ```
- Frontend (Next.js lint)
  ```bash path=null start=null
  npm run lint --prefix frontend
  ```
- Frontend type-check only
  ```bash path=null start=null
  npm run type-check --prefix frontend
  ```

Tests (backend)
- Run all tests
  ```bash path=null start=null
  npm test --prefix backend
  ```
- Watch mode
  ```bash path=null start=null
  npm run test:watch --prefix backend
  ```
- Coverage
  ```bash path=null start=null
  npm run test:cov --prefix backend
  ```
- E2E (if test/jest-e2e.json is configured)
  ```bash path=null start=null
  npm run test:e2e --prefix backend
  ```
- Run a single test file or pattern
  ```bash path=null start=null
  # Example: run only shipment service specs
  npm run test --prefix backend -- shipment.service.spec.ts
  # Or any Jest pattern
  npm run test --prefix backend -- shipments/.*\.spec\.ts
  ```

Database and migrations (backend)
- Generate a migration (append a name via extra args)
  ```bash path=null start=null
  npm run migration:generate --prefix backend -- -n AddUsersTable
  ```
- Run migrations
  ```bash path=null start=null
  npm run migration:run --prefix backend
  ```
- Revert last migration
  ```bash path=null start=null
  npm run migration:revert --prefix backend
  ```
- Seed initial admin user
  ```bash path=null start=null
  npm run create-admin --prefix backend
  ```

Docker
- Full stack (postgres + backend + frontend + nginx) with Compose profiles
  - With modern Docker CLI (docker compose)
    ```bash path=null start=null
    docker compose --profile full-stack up -d
    docker compose --profile full-stack logs -f
    docker compose --profile full-stack down
    ```
  - With classic docker-compose (set COMPOSE_PROFILES in PowerShell)
    ```bash path=null start=null
    $env:COMPOSE_PROFILES = "full-stack"; docker-compose up -d
    docker-compose logs -f
    docker-compose down
    ```
- Backend only
  ```bash path=null start=null
  docker compose --profile backend-only up -d
  ```
- Frontend only
  ```bash path=null start=null
  docker compose --profile frontend-only up -d
  ```
- Single-app image (runs both backend and frontend in one container)
  ```bash path=null start=null
  docker compose --profile single-app up -d
  ```

High-level architecture
- Backend (NestJS + TypeORM)
  - Entry: backend/src/main.ts boots Nest app, sets up global pipes/filters, Swagger, CORS.
  - Configuration: backend/src/config/database.config.ts wires TypeORM (PostgreSQL by default; supports DATABASE_URL and SSL).
  - Entities: backend/src/entities/*.entity.ts define core tables (User, Client, Shipment, PaymentRecord, Ad, Setting, CustomerAccount, etc.).
  - Modules and features (selected):
    - auth and customer-auth: Local + JWT strategies, guards for admin and customer flows, token issuance, change password; guards include jwt-auth.guard.ts, admin.guard.ts, and customer-jwt-auth.guard.ts.
    - users, clients, shipments, ads, settings: CRUD controllers/services with DTO validation; file uploads (multer) used for ads.
    - reports: aggregates dashboard metrics and exports CSV via csv-writer.
    - shipsgo-tracking: integrates with external ShipsGo tracking (DTOs for BL, booking, container; service uses axios; rate-limit guard and exception filter exist under common/).
    - customer-portal and admin modules expose role-scoped controllers aggregating operations for respective UIs, plus a public-tracking controller for anonymous tracking.
  - Cross-cutting concerns:
    - common/filters/shipsgo-exception.filter.ts and common/guards/shipsgo-rate-limit.guard.ts provide resilience/integration boundaries.
    - Validation via class-validator/transformer on DTOs; security hardening with helmet and throttler.
    - Seeds/scripts: src/scripts/seed-admin.ts and seed-test-data.ts aid bootstrapping.

- Frontend (Next.js 14 + Tailwind + next-i18next)
  - Pages-driven routing under frontend/src/pages with two main areas:
    - /admin/*: admin console (dashboard, clients, shipments, ads, reports, users, settings, tracking).
    - /customer/*: customer portal (dashboard, financial, shipments, live tracking, profile, login).
    - Public pages: home, about, services, tracking, ads, contact.
    - API routes under /pages/api/* (customer-auth, customer-portal, public-tracking, settings) act as a thin server-side proxy to the backend to simplify CORS and keep credentials server-side when needed.
  - Shared UI and utilities under src/components (Admin, Layout, Tracking, ui/*), src/lib (api.ts, auth.tsx), hooks (useDebounce, useLocalStorage), and styles (Tailwind setup).
  - i18n configured via next-i18next.config.js; RTL/LTR supported by design.

Notes and caveats
- Root package.json includes convenience scripts (build, dev, test). For migrations, prefer backend scripts directly (migration:generate/run/revert). If you see README references to migration:run-prod or test-db, use the existing backend scripts above instead.
- docker-compose.yml uses profiles for service selection; explicitly pass a profile as shown in the Docker section.
- Default ports and environment can be overridden via .env files and compose env vars (NEXT_PUBLIC_API_URL, FRONTEND_URL, DB_* or DATABASE_URL, JWT_SECRET).
