# AI Task Manager Backend

FastAPI service that powers AI task categorisation, Gemini-driven insights, and the daily brief consumed by the Vite/React frontend.

## Environment Variables

- `GEMINI_API_KEY` – required for Google Gemini access through JacMachine/byllm.
- `PORT` – Render/Heroku style port binding. Defaults to `8000` when running locally.

## Local Development

```bash
cd ai-task-manager/backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
export GEMINI_API_KEY=your_key     # Windows: set GEMINI_API_KEY=your_key
uvicorn main:app --reload
```

The API is then available at `http://127.0.0.1:8000` with interactive docs at `/docs`.

## Railway Deployment (Recommended)

Railway can build and run the FastAPI service directly from this repository without any extra CLI tooling:

1. Sign in at [railway.app](https://railway.app) and create a new project.
2. Choose **Deploy from GitHub** and select `rayklanderman/jaseci-proj`.
3. When prompted, set the service root to `ai-task-manager/backend`.
4. Confirm (or set) the build/start commands:
   - **Build:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add the required environment variables (at minimum `GEMINI_API_KEY`).
6. Deploy — Railway will provision the service and expose a public URL you can share with the frontend.

Once deployed, update the Vercel project with `VITE_BACKEND_BASE_URL=<railway-url>` so the React app uses the hosted backend. The frontend continues to rely on **Yarn**; keep `yarn` commands for the Vite workspace and `pip` for this FastAPI service.

## Alternate Deployment Targets

- **Railway / Fly.io / Cloud Run** – Any Python-friendly host that supports long-running services works. Adjust build/start commands accordingly.
- **Docker** – Build an image with Python 3.11+, install dependencies, copy the backend, and expose port 8000.

## Key Endpoints

- `GET /HealthCheck` – liveness probe returning AI availability and metadata.
- `GET /ServiceInfo` – capability summary consumed by the frontend service info panel.
- `GET /tasks` / `POST /tasks` – CRUD operations with AI metadata attached.
- `GET /ai-brief` – structured daily brief consumed by the React sidebar.
