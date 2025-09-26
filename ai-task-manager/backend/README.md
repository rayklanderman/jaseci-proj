# AI Task Manager Backend

## Deployment Options

### Option 1: Railway (Recommended)

- Supports Python/Jac applications
- Easy deployment from GitHub
- Built-in PostgreSQL if needed
- Command: `jac serve task_manager_api.jac`

### Option 2: Heroku

- Python buildpack compatible
- Procfile: `web: jac serve task_manager_api.jac --port $PORT`

### Option 3: Docker

- Use Python 3.11+ base image
- Install jaclang
- Expose port 8000

## Environment Variables

- `GOOGLE_API_KEY`: Your Gemini API key for AI features
- `PORT`: Service port (default: 8000)

## API Endpoints

### POST /TaskAPI

Create, complete, list, or delete tasks

**Create Task:**

```json
{
  "action": "create",
  "description": "Finish quarterly report"
}
```

**List Tasks:**

```json
{
  "action": "list"
}
```

**Complete Task:**

```json
{
  "action": "complete",
  "task_id": 1234
}
```

### GET /HealthCheck

Check service status

### GET /ServiceInfo

Get API documentation

## Local Development

```bash
jac run task_manager_api.jac  # CLI mode
jac serve task_manager_api.jac  # Service mode
```
