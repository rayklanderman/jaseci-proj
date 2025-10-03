# AI Task Manager Frontend (Vite + React + TypeScript)

Progressive Web App that powers the AI Task Manager experience. It connects to the FastAPI/Jac backend hosted on Railway and falls back to local simulation mode if the backend is unreachable.

## Quick Start

```bash
cd ai-task-manager/frontend
yarn install
yarn dev
```

The development server runs at <http://localhost:5173/>.

## Environment Variables

Copy `.env.example` to `.env` (or configure variables in your hosting provider):

- `VITE_BACKEND_BASE_URL` – URL of the production backend. Example: `https://ai-task-manager-production.up.railway.app`

When the variable is omitted the app automatically uses:

- `http://localhost:8000` during local development
- `<current-origin>/api` in production (allows proxying through rewrites if desired)

## Build & Preview

```bash
yarn build
yarn preview
```

## Deployment (Vercel)

1. Set the project root to `ai-task-manager/frontend` in Vercel.
2. Configure the build command `yarn install && yarn build` and output directory `dist`.
3. In **Project Settings → Environment Variables**, add `VITE_BACKEND_BASE_URL` pointing to the Railway backend URL.
4. Redeploy the site; the bundle will include the production API endpoint.

## Key Features

- Responsive glassmorphism UI with Tailwind CSS.
- Installable PWA with offline caching and service worker.
- Auto-detection of backend availability and graceful fallback to simulated mode.
- Type-safe API layer (`src/types/api.ts`) shared across services.
- Modular task views (`TaskManager`, `TaskManagerPro`, `TaskTemplates`).

## Project Scripts

- `yarn dev` – start the Vite dev server.
- `yarn build` – create an optimized production build.
- `yarn preview` – serve the production build locally.

Use `yarn lint` if you enable linting rules in `eslint.config.js`.
