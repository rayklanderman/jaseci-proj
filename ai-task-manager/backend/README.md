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

## Render (CLI) Deployment

This repository now includes a `render.yaml` blueprint that provisions the backend as a Render Web Service. Deployment steps:

```bash
# 1) Install the Render CLI
npm install -g render-cli

# 2) Authenticate
render login

# 3) Launch the service from the repo root
render blueprint launch render.yaml --name ai-task-manager-backend

# 4) Set required secrets (after the service is created)
render env set ai-task-manager-backend GEMINI_API_KEY <your-key>

# 5) Trigger a deploy when needed
render deploy ai-task-manager-backend
```

Render will build from `ai-task-manager/backend`, install `requirements.txt`, and run `uvicorn main:app --host 0.0.0.0 --port $PORT` automatically. Subsequent pushes to the tracked branch trigger auto-deploys unless disabled.

> ℹ️ The frontend continues to use **Yarn** as the package manager. Keep `yarn` commands for the Vite project and `pip` for the FastAPI backend.

## Alternate Deployment Targets

- **Railway / Fly.io / Cloud Run** – Any Python-friendly host that supports long-running services works. Adjust build/start commands accordingly.
- **Docker** – Build an image with Python 3.11+, install dependencies, copy the backend, and expose port 8000.

## Key Endpoints

- `GET /HealthCheck` – liveness probe returning AI availability and metadata.
- `GET /ServiceInfo` – capability summary consumed by the frontend service info panel.
- `GET /tasks` / `POST /tasks` – CRUD operations with AI metadata attached.
- `GET /ai-brief` – structured daily brief consumed by the React sidebar.
