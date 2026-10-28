# Deployment and Operations Guide

This document details the automated deployment pipeline, cloud infrastructure on Render and Vercel, required secrets, rollback procedures, and test plans.

---

## 1. Architecture Overview

- **Backend Web API (`apps/api`)**: Node 20 Express service deployed to Render. Runs database migrations (`prisma migrate deploy`) on container start before booting the HTTP server.
- **Background Worker (`apps/worker`)**: BullMQ worker deployed to Render as a Background Worker service. Triggered only after the API is live.
- **Database (`daily-health-db`)**: Managed PostgreSQL 15 on Render.
- **Cache & Queue Broker (`daily-health-redis`)**: Managed Redis 7 on Render.
- **Frontend Web App (`apps/web`)**: React 18 + Vite PWA deployed to Vercel.

---

## 2. Secrets & Environment Variables Matrix

### A. GitHub Secrets (Repository / Environment Level)

| Secret Name | Scope | Description |
|---|---|---|
| `RENDER_API_KEY` | Repo | Render Personal Access Token (prefixed `rnd_...`). |
| `RENDER_API_SERVICE_ID` | Staging / Prod | Service ID of the Render Web Service for the API (`srv-...`). |
| `RENDER_WORKER_SERVICE_ID` | Staging / Prod | Service ID of the Render Background Worker (`srv-...`). |
| `API_URL` | Staging / Prod | Fully-qualified URL of the deployed API (e.g. `https://api-staging.yourdomain.com`). |
| `DEPLOY_NOTIFICATION_WEBHOOK_URL` | Optional | Webhook URL for Slack or Telegram deploy notifications. |

### B. Render Environment Variables (API & Worker)

Configured automatically via `render.yaml` or Render Dashboard:

| Variable | Target | Description |
|---|---|---|
| `NODE_ENV` | API & Worker | Set to `production`. |
| `DATABASE_URL` | API & Worker | Connection string linked from `daily-health-db`. |
| `REDIS_URL` | API & Worker | Connection string linked from `daily-health-redis`. |
| `JWT_ACCESS_SECRET` | API | Minimum 32-character secret for short-lived access tokens. |
| `JWT_REFRESH_SECRET` | API | Minimum 32-character secret for rotating refresh tokens. |
| `FIELD_ENCRYPTION_KEY` | API | 64-character hex string (32 bytes) for AES-256-GCM encryption of medical notes. |
| `CLIENT_ORIGIN` | API | Allowed frontend origin (e.g. `https://app.yourdomain.com`). |
| `PORT` | API | Listening port (`4000` or Render auto-assigned). |

### C. Vercel Environment Variables (Frontend)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Public endpoint for backend API (e.g. `https://daily-health-api.onrender.com/api`). |
| `VITE_VAPID_PUBLIC_KEY` | Public VAPID key matching the API's push notification service. |

---

## 3. Automated Deploy Agent Workflow (`scripts/deploy/deploy-agent.ts`)

Run manually or via GitHub Actions:

```bash
npm run deploy -- --env staging
npm run deploy -- --env production
```

### Execution Steps:
1. **GitHub CI Gate**: Polls GitHub REST API for status checks on the triggering commit (up to 15-minute timeout).
2. **Staged Render Deployment**:
   - Fetches the last known live deploy ID for both API and Worker.
   - Deploys `daily-health-api` first. Render runs `prisma migrate deploy` prior to application startup.
   - Polls Render status (`created` -> `build_in_progress` -> `live`).
   - Only when API is reported `live`, triggers deployment of `daily-health-worker`.
3. **Health & Readiness Verification**:
   - Queries `/api/health` (process responsiveness) and `/api/health/ready` (DB & Redis ping).
   - Retries up to 10 times with 15-second backoff intervals.
4. **Automated Rollback on Failure**:
   - If build fails, health checks fail, or timeout occurs, immediately initiates rollbacks on both services to their previous live deploy IDs.
   - Verifies health post-rollback.
   - **Crucial Warning**: Database migrations are *not* automatically reverted on rollback. Backward-compatible migrations are required.
5. **Sanitized Notifications**:
   - Sends duration, status, and short commit SHA to Slack/Telegram.
   - All credentials, tokens, and health payload data are strictly redacted.

---

## 4. Operational Test Plan

### Test Plan 1: Staging Happy Path
1. Push a verified commit to `staging` branch.
2. Ensure CI passes in `.github/workflows/ci.yml`.
3. Observe `.github/workflows/deploy.yml` starting.
4. Verify `scripts/deploy/deploy-agent.ts` outputs:
   - CI passed.
   - API deployed and live.
   - Worker deployed and live.
   - Health checks returned `200 OK` for `/api/health` and `/api/health/ready`.

### Test Plan 2: Health Check Failure & Rollback Test
1. Introduce a deliberate failure in `apps/api/src/modules/health/health.controller.ts` where `/api/health/ready` returns `503 Service Unavailable`.
2. Push to staging branch.
3. Observe Deploy Agent:
   - Detects readiness failure after retry attempts.
   - Triggers automatic rollback of API and Worker to prior deploy IDs.
   - Emits warning concerning DB migrations.
   - Dispatches failure webhook notification.
   - Exits with status code `1`.
