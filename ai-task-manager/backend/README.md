# AI Task Manager Backend

FastAPI service that powers AI task categorisation, Gemini-driven insights, and the daily brief consumed by the Vite/React frontend.

## Environment Variables

Create a `.env` file (or configure variables directly in your platform) using the template in `.env.example`:

- `GEMINI_API_KEY` – required for Google Gemini access through JacMachine/byllm.
- `DATABASE_URL` – SQLModel connection string. Defaults to local SQLite when omitted; use PostgreSQL for production (e.g. `postgresql+psycopg://user:pass@host:5432/dbname`).
- `FRONTEND_ORIGINS` – comma-separated list of allowed origins for CORS (e.g. your Vercel deployment and custom domains).
- `PORT` – optional port override for hosts that inject a port (defaults to `8000`).

## Local Development

```bash
cd ai-task-manager/backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env               # Windows: copy .env.example .env
# edit .env with your GEMINI_API_KEY and (optionally) DATABASE_URL
uvicorn main:app --reload
```

The API boots on `http://127.0.0.1:8000` with interactive docs at `/docs`. By default it persists data to `task_manager.db` (SQLite). Provide a PostgreSQL `DATABASE_URL` to mirror production.

## Railway Deployment (Backend)

Railway is the production target for the backend. Use a managed PostgreSQL database for persistence and configure the service to accept your Vercel frontend origin.

1. **Create the service**
   - Sign in at [railway.app](https://railway.app) → create a project → **Deploy from GitHub** → select `rayklanderman/jaseci-proj`.
   - Set the service root to `ai-task-manager/backend`.
2. **Provision PostgreSQL**
   - Add a **PostgreSQL** database plugin inside the same project.
   - Copy the provided connection string and convert it to SQLModel/SQLAlchemy format, e.g. `postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE`.
3. **Configure environment variables**
   - `GEMINI_API_KEY` – required for AI brief generation.
   - `DATABASE_URL` – use the converted Railway connection string.
   - `FRONTEND_ORIGINS` – include your Vercel domain(s), e.g. `https://ai-task-manager.vercel.app`.
4. **Build / start commands**
   - **Build:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Deploy and verify**
   - Trigger a deploy. Once running, open the public URL and confirm `/HealthCheck` returns `status: "healthy"`.
6. **Keep the free tier awake** _(optional but recommended)_
   - Add an UptimeRobot HTTP monitor pointing at the Railway URL with a 5-minute interval to avoid cold starts.

Share the deployed URL with the frontend by setting `VITE_BACKEND_BASE_URL` in Vercel (see frontend README).

## Alternate Deployment Targets

- **Railway / Fly.io / Cloud Run** – Any Python-friendly host that supports long-running services works. Adjust build/start commands accordingly.
- **Docker** – Build an image with Python 3.11+, install dependencies, copy the backend, and expose port 8000.

## Key Endpoints

- `GET /HealthCheck` – liveness probe returning AI availability and metadata.
- `GET /ServiceInfo` – capability summary consumed by the frontend service info panel.
- `GET /tasks` / `POST /tasks` – CRUD operations with AI metadata attached.
- `GET /ai-brief` – structured daily brief consumed by the React sidebar.
