# Deployment Status

## Latest Update: October 2, 2025 – Split Deployment Ready

✅ **Backend refactor deployed locally** – FastAPI now persists tasks with SQLModel + PostgreSQL
✅ **Environment templates committed** – `.env.example` files for backend and frontend published
✅ **Railway target locked** – Service root `ai-task-manager/backend`, PostgreSQL add-on required
✅ **Vercel frontend** – Build remains `ai-task-manager/frontend`
🔄 **Pending rollout** – Needs final env configuration and redeploy on both platforms

## Current Architecture

- **Frontend**: Vercel (Static build from `frontend`, uses `VITE_BACKEND_BASE_URL`)
- **Backend**: Railway (FastAPI service with Jac AI + PostgreSQL persistence)
- **CORS**: Controlled via `FRONTEND_ORIGINS`
- **Wakefulness**: UptimeRobot recommended for free-tier Railway services

## Immediate Actions

1. **Railway Environment**
   - Provision PostgreSQL plugin → copy `DATABASE_URL` (`postgresql+psycopg://` format)
   - Set `GEMINI_API_KEY`, `DATABASE_URL`, `FRONTEND_ORIGINS`
   - Trigger deploy and verify `/HealthCheck`
2. **Vercel Environment**
   - Set `VITE_BACKEND_BASE_URL` to the Railway URL
   - Redeploy frontend so runtime bundles receive the new URL
3. **Reliability**
   - Configure an UptimeRobot HTTP monitor (5-minute interval) targeting the Railway URL
   - Optional: enable Railway volume for SQLite fallback if Postgres is unavailable

## Verification Checklist

- [ ] Railway deploy green with PostgreSQL
- [ ] `/HealthCheck` returns `healthy`
- [ ] Vercel build succeeds with new env var
- [ ] Frontend fetches tasks from Railway in production
- [ ] UptimeRobot monitor online
