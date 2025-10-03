"""
AI Task Manager Backend
FastAPI server with Jac integration and AI-powered task categorization
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
import datetime
import uuid
import os
import subprocess
import sys
import json
import re
from sqlmodel import SQLModel, Field, Session, create_engine, select
from sqlalchemy import Column, JSON, func
import shutil

# Jac Integration - Import AI capabilities
try:
    from jaclang import JacMachine

    if not hasattr(JacMachine, "run_jac_file"):
        def _run_jac_file(self, file_path: str) -> Optional[str]:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Jac file not found: {file_path}")

            candidate_commands = []
            jac_executable = shutil.which("jac")
            if jac_executable:
                candidate_commands.append([jac_executable, "run", file_path])

            candidate_commands.extend(
                [
                    [sys.executable, "-m", "jaclang.cli.cli", "run", file_path],
                    [sys.executable, "-m", "jaclang.cli", "run", file_path],
                ]
            )

            last_error: Optional[str] = None
            for cmd in candidate_commands:
                try:
                    result = subprocess.run(
                        cmd,
                        capture_output=True,
                        text=True,
                        timeout=60,
                    )
                except subprocess.TimeoutExpired as timeout_err:
                    raise RuntimeError(
                        f"Jac execution timed out for {file_path}"
                    ) from timeout_err

                if result.returncode == 0:
                    return result.stdout.strip()

                stderr = result.stderr.strip()
                last_error = f"Jac execution failed ({result.returncode})" + (
                    f": {stderr}" if stderr else ""
                )

            raise RuntimeError(last_error or "Jac execution failed")

        setattr(JacMachine, "run_jac_file", _run_jac_file)

    # Check for Gemini API key
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        # Create Jac machine for executing AI code
        jac_machine = JacMachine()
        AI_AVAILABLE = True
        print("✅ Jac AI integration with byllm and Gemini ready")
    else:
        AI_AVAILABLE = False
        print("⚠️ GEMINI_API_KEY not found, using fallback mode")
        print("💡 Set your API key: $env:GEMINI_API_KEY='your_key_here'")
        
except Exception as e:
    print(f"⚠️ Jac AI integration failed, using fallback: {e}")
    AI_AVAILABLE = False

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./task_manager.db")
engine_kwargs: dict = {"pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, echo=False, **engine_kwargs)


class TaskRecord(SQLModel, table=True):
    __tablename__ = "tasks"
    __table_args__ = {"extend_existing": True}
    id: str = Field(primary_key=True)
    content: str
    category: str
    priority: str
    status: str
    ai_reasoning: str = Field(default="AI analysis completed")
    ai_confidence: Optional[float] = None
    ai_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    created_at: str
    updated_at: str

app = FastAPI(
    title="🤖 AI Task Manager API",
    description="AI-powered task management with intelligent categorization using Jac language integration",
    version="1.0.0"
)

# CORS middleware for frontend integration
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
configured_origins = os.getenv("FRONTEND_ORIGINS")
allowed_origins = (
    [origin.strip() for origin in configured_origins.split(",") if origin.strip()]
    if configured_origins
    else default_origins
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class TaskCreate(BaseModel):
    content: str

class TaskUpdate(BaseModel):
    status: Optional[str] = None

class Task(BaseModel):
    id: str
    content: str
    category: str
    priority: str
    status: str
    ai_reasoning: str
    ai_confidence: Optional[float] = None
    ai_tags: Optional[List[str]] = None
    created_at: str
    updated_at: str

class TaskResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    task: Optional[Task] = None
    tasks: Optional[List[Task]] = None
    total: Optional[int] = None
    error: Optional[str] = None

class AnalyticsResponse(BaseModel):
    success: bool
    analytics: dict


class AIBriefAgendaItem(BaseModel):
    title: str
    details: str
    priority: Optional[str] = None
    suggested_time: Optional[str] = None
    related_task_ids: List[str] = []


class AIBriefData(BaseModel):
    summary: str
    agenda: List[AIBriefAgendaItem]
    recommendations: List[str]
    ai_available: bool
    generated_at: str


class AIBriefResponse(BaseModel):
    success: bool
    data: AIBriefData
    error: Optional[str] = None


def task_record_to_model(record: TaskRecord) -> Task:
    return Task(
        id=record.id,
        content=record.content,
        category=record.category,
        priority=record.priority,
        status=record.status,
        ai_reasoning=record.ai_reasoning,
        ai_confidence=record.ai_confidence,
        ai_tags=record.ai_tags or [],
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


def load_tasks(session: Session) -> List[Task]:
    records = session.exec(select(TaskRecord).order_by(TaskRecord.created_at)).all()
    return [task_record_to_model(record) for record in records]


def get_task_by_id(session: Session, task_id: str) -> Optional[TaskRecord]:
    return session.get(TaskRecord, task_id)


def get_task_count(session: Session) -> int:
    return session.exec(select(func.count(TaskRecord.id))).one()


def build_fallback_brief(tasks: List[Task]) -> dict:
    pending_tasks = [task for task in tasks if task.status != "completed"]
    completed_tasks = [task for task in tasks if task.status == "completed"]

    if not tasks:
        summary = "No tasks logged yet – add a few to generate a personalised brief."
    elif not pending_tasks:
        summary = "All tasks are cleared. Celebrate the win and queue the next priorities!"
    else:
        top_priority = max(
            pending_tasks,
            key=lambda t: priority_score(getattr(t, "priority", None)),
            default=None,
        )
        focus_category = pending_tasks[0].category if pending_tasks else "Personal"
        summary = (
            f"{len(pending_tasks)} tasks remaining. Focus on {focus_category} work first to maintain momentum."
        )
        if top_priority and priority_score(getattr(top_priority, "priority", None)) == 3:
            summary = (
                f"High-priority alert: '{top_priority.content}' needs attention. Clear it before tackling other items."
            )

    agenda = []
    for task in pending_tasks[:3]:
        agenda.append(
            {
                "title": task.content[:80] + ("…" if len(task.content) > 80 else ""),
                "details": f"{task.category} • Priority {task.priority}",
                "priority": task.priority,
                "suggested_time": None,
                "related_task_ids": [task.id],
            }
        )

    recommendations: List[str] = []
    if pending_tasks and completed_tasks:
        recommendations.append(
            "Batch similar tasks to finish the remaining items faster."
        )
    if len(pending_tasks) > len(completed_tasks) * 2:
        recommendations.append(
            "Start with the quickest task to build momentum, then move to the highest priority."
        )
    if not recommendations:
        recommendations.append(
            "Maintain your current cadence and review upcoming deadlines."
        )

    return {
        "summary": summary,
        "agenda": agenda,
        "recommendations": recommendations,
        "generated_at": datetime.datetime.now().isoformat(),
        "ai_available": False,
    }


def generate_ai_brief(tasks: List[Task]) -> dict:
    fallback_brief = build_fallback_brief(tasks)

    if not tasks or not AI_AVAILABLE:
        fallback_brief["ai_available"] = AI_AVAILABLE and bool(tasks)
        return fallback_brief

    try:
        serialisable_tasks = [
            {
                "id": task.id,
                "content": task.content,
                "category": task.category,
                "priority": task.priority,
                "status": task.status,
                "created_at": task.created_at,
                "ai_confidence": task.ai_confidence,
            }
            for task in tasks
        ]

        tasks_payload = json.dumps(serialisable_tasks).replace("\n", " ")

        jac_script = f'''
import from byllm.llm {{ Model }}

glob llm = Model(model_name="gemini/gemini-2.0-flash");

def craft_brief(prompt: str) -> str by llm(method='Reason');

with entry {{
    prompt = """
You are an AI sprint planner. Produce a JSON response with keys summary (string), agenda (array of items with title, details, priority, suggested_time, related_task_ids), and recommendations (array of strings).

Focus on realistic scheduling guidance for the next 8 hours. Use the provided tasks as context. Keep agenda length between 2 and 5 items. related_task_ids must be an array of task IDs pulled from the input.

Return ONLY valid JSON with double-quoted keys and values.

Tasks JSON: {tasks_payload}
""";
    result = craft_brief(prompt);
    print(result);
}}
'''

        temp_file = "temp_ai_brief.jac"
        with open(temp_file, "w", encoding="utf-8") as f:
            f.write(jac_script)

        try:
            result = jac_machine.run_jac_file(temp_file)
            parsed = parse_json_output(result)
            if isinstance(parsed, dict):
                agenda_items = []
                for item in parsed.get("agenda", []):
                    if isinstance(item, dict):
                        agenda_items.append(
                            {
                                "title": str(item.get("title", "Focus block"))[:120],
                                "details": str(item.get("details", "")),
                                "priority": normalize_priority(item.get("priority")),
                                "suggested_time": item.get("suggested_time"),
                                "related_task_ids": [
                                    str(task_id)
                                    for task_id in item.get("related_task_ids", [])
                                ],
                            }
                        )
                    elif isinstance(item, str):
                        agenda_items.append(
                            {
                                "title": item[:120],
                                "details": "",
                                "priority": None,
                                "suggested_time": None,
                                "related_task_ids": [],
                            }
                        )

                recommendations = [
                    str(rec).strip()
                    for rec in parsed.get("recommendations", [])
                    if isinstance(rec, str) and rec.strip()
                ]

                if not recommendations:
                    recommendations = fallback_brief.get("recommendations", [])

                return {
                    "summary": str(parsed.get("summary", fallback_brief["summary"])),
                    "agenda": agenda_items or fallback_brief.get("agenda", []),
                    "recommendations": recommendations,
                    "generated_at": datetime.datetime.now().isoformat(),
                    "ai_available": True,
                }
        finally:
            try:
                os.remove(temp_file)
            except Exception:
                pass
    except Exception as e:
        print(f"AI brief generation failed: {e}")

    return fallback_brief

ALLOWED_CATEGORIES = {
    "work": "Work",
    "personal": "Personal",
    "health": "Health",
    "learning": "Learning",
}

ALLOWED_PRIORITIES = {
    "high": "High",
    "medium": "Medium",
    "low": "Low",
}


def normalize_category(value: Optional[str]) -> str:
    if not value:
        return "Personal"
    return ALLOWED_CATEGORIES.get(value.strip().lower(), "Personal")


def normalize_priority(value: Optional[str]) -> str:
    if not value:
        return "Medium"
    return ALLOWED_PRIORITIES.get(value.strip().lower(), "Medium")


def priority_score(value: Optional[str]) -> int:
    mapping = {"high": 3, "medium": 2, "low": 1}
    return mapping.get((value or "").strip().lower(), 2)


def clamp_confidence(value: Optional[float]) -> float:
    try:
        if value is None:
            return 0.6
        return max(0.0, min(float(value), 1.0))
    except (TypeError, ValueError):
        return 0.6


def sanitise_tags(tags: Optional[List[Any]]) -> List[str]:
    if not tags:
        return []
    cleaned: List[str] = []
    for tag in tags:
        if isinstance(tag, str):
            trimmed = tag.strip()
            if trimmed:
                cleaned.append(trimmed)
    return cleaned


def parse_json_output(output: Any) -> Optional[Any]:
    if output is None:
        return None
    text = str(output).strip()
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return None
    return None


def build_ai_result(
    category: Optional[str],
    priority: Optional[str],
    reasoning: Optional[str],
    confidence: Optional[float] = None,
    tags: Optional[List[Any]] = None,
) -> dict:
    normalised_category = normalize_category(category)
    normalised_priority = normalize_priority(priority)
    confidence_value = clamp_confidence(confidence)
    cleaned_tags = sanitise_tags(tags)
    if not cleaned_tags:
        cleaned_tags = [normalised_category]
    detail = (reasoning or "AI analysis completed").strip()
    return {
        "category": normalised_category,
        "priority": normalised_priority,
        "reasoning": detail,
        "confidence": confidence_value,
        "tags": cleaned_tags,
    }

def categorize_task_with_ai(content: str) -> dict:
    """AI-powered task categorization using Jac byllm integration"""
    fallback_result = categorize_with_fallback(content)

    if AI_AVAILABLE:
        try:
            safe_content = content.replace("\\", "\\\\").replace('"', '\\"')
            jac_script = f'''
import from byllm.llm {{ Model }}

glob llm = Model(model_name="gemini/gemini-2.0-flash");

def analyze_task(prompt: str) -> str by llm(method='Reason');

with entry {{
    prompt = """
You are an AI productivity coach. Analyse the following task description and return a JSON object with the keys category, priority, reasoning, confidence (0 to 1 float) and tags (array of short strings).

Allowed categories: Work, Personal, Health, Learning.
Allowed priorities: High, Medium, Low.

Respond with ONLY valid JSON. Do not include markdown or commentary.

Task: """ + "{safe_content}";
    result = analyze_task(prompt);
    print(result);
}}
'''

            temp_file = "temp_task_analysis.jac"
            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(jac_script)

            try:
                result = jac_machine.run_jac_file(temp_file)
                parsed = parse_json_output(result)
                if isinstance(parsed, dict):
                    return build_ai_result(
                        parsed.get("category"),
                        parsed.get("priority"),
                        parsed.get("reasoning"),
                        parsed.get("confidence"),
                        parsed.get("tags"),
                    )
                else:
                    print("AI response was not valid JSON, falling back to heuristic result")
            except Exception as e:
                print(f"Jac execution error: {e}")
                simple_ai = categorize_with_simple_byllm(content)
                if simple_ai:
                    return simple_ai
            finally:
                try:
                    os.remove(temp_file)
                except Exception:
                    pass
        except Exception as e:
            print(f"AI categorization failed: {e}")

    return fallback_result

def categorize_with_simple_byllm(content: str) -> dict:
    """Simple byllm approach without complex Jac machine"""
    try:
        # Create minimal Jac script
        simple_script = f'''
import from byllm.llm {{ Model }}
glob llm = Model(model_name="gemini/gemini-2.0-flash");
def quick_analyze(task: str) -> str by llm();
with entry {{
    result = quick_analyze("Categorize '{content}' as work/personal/health/learning and priority as high/medium/low. Format: category,priority,reason");
    print(result);
}}
'''
        
        with open("simple_analysis.jac", "w") as f:
            f.write(simple_script)
        
        result = jac_machine.run_jac_file("simple_analysis.jac")
        os.remove("simple_analysis.jac")
        
        parsed = parse_json_output(result)
        if isinstance(parsed, dict):
            return build_ai_result(
                parsed.get("category"),
                parsed.get("priority"),
                parsed.get("reasoning"),
                parsed.get("confidence"),
                parsed.get("tags"),
            )

        # Simple parsing fallback
        if result and "," in str(result):
            parts = [part.strip() for part in str(result).split(",")]
            return build_ai_result(
                parts[0] if len(parts) > 0 else None,
                parts[1] if len(parts) > 1 else None,
                parts[2] if len(parts) > 2 else "AI quick analysis",
                0.6,
                None,
            )
            
    except Exception as e:
        print(f"Simple byllm failed: {e}")
    
    return categorize_with_fallback(content)

def categorize_with_fallback(content: str) -> dict:
    """Pattern-based fallback categorization"""
    # Fallback categorization logic
    fallback_categories = {
        "work": ["project", "meeting", "report", "email", "deadline", "client", "business", "office"],
        "personal": ["buy", "call", "visit", "appointment", "family", "friend", "home"],
        "health": ["exercise", "doctor", "gym", "medicine", "health", "fitness", "wellness"],
        "learning": ["study", "read", "course", "learn", "tutorial", "book", "research"]
    }
    
    content_lower = content.lower()
    category = "personal"  # default
    priority = "medium"    # default
    
    # Determine category
    for cat, keywords in fallback_categories.items():
        if any(keyword in content_lower for keyword in keywords):
            category = cat
            break
    
    # Determine priority
    urgent_words = ["urgent", "asap", "critical", "emergency", "immediately", "now", "today"]
    low_priority_words = ["maybe", "someday", "eventually", "when", "if possible"]
    
    if any(word in content_lower for word in urgent_words):
        priority = "high"
    elif any(word in content_lower for word in low_priority_words):
        priority = "low"
    elif len(content) > 100:  # Long descriptions might be important
        priority = "high"
    elif len(content) < 20:   # Short tasks might be quick wins
        priority = "low"
        
    normalised_category = normalize_category(category)
    normalised_priority = normalize_priority(priority)
    reasoning = (
        f"Pattern matching suggests '{normalised_category}' with '{normalised_priority}' priority based on task keywords."
    )

    return build_ai_result(
        normalised_category,
        normalised_priority,
        reasoning,
        0.45 if normalised_priority == "Low" else 0.55,
        ["Pattern Match", normalised_category],
    )

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "🤖 AI Task Manager API",
        "status": "running",
        "ai_integration": "Jac Language" if AI_AVAILABLE else "Fallback Pattern Matching",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "tasks": "/tasks",
            "create_task": "POST /tasks",
            "update_task": "PUT /tasks/{task_id}",
            "delete_task": "DELETE /tasks/{task_id}",
            "analytics": "/analytics"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    with Session(engine) as session:
        tasks_count = get_task_count(session)
    return {
        "status": "healthy",
        "service": "AI Task Manager",
        "ai_available": AI_AVAILABLE,
        "tasks_count": tasks_count,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/HealthCheck")
async def health_check_frontend():
    """Health check endpoint for frontend (capitalized)"""
    with Session(engine) as session:
        tasks_count = get_task_count(session)
    return {
        "status": "healthy",
        "service": "AI Task Manager", 
        "ai_available": AI_AVAILABLE,
        "tasks_count": tasks_count,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/tasks", response_model=TaskResponse)
async def get_tasks():
    """Get all tasks"""
    with Session(engine) as session:
        tasks = load_tasks(session)
    return TaskResponse(
        success=True,
        tasks=tasks,
        total=len(tasks)
    )

@app.post("/tasks", response_model=TaskResponse)
async def create_task(task_data: TaskCreate):
    """Create a new task with AI categorization"""
    if not task_data.content or not task_data.content.strip():
        raise HTTPException(status_code=400, detail="Task content cannot be empty")
    
    # Generate unique ID
    task_id = str(uuid.uuid4())
    timestamp = datetime.datetime.now().isoformat()
    
    # AI categorization
    ai_result = categorize_task_with_ai(task_data.content)
    
    # Create task
    new_record = TaskRecord(
        id=task_id,
        content=task_data.content.strip(),
        category=ai_result["category"],
        priority=ai_result["priority"],
        status="pending",
        ai_reasoning=ai_result["reasoning"],
        ai_confidence=ai_result.get("confidence"),
        ai_tags=[str(tag) for tag in ai_result.get("tags", [])],
        created_at=timestamp,
        updated_at=timestamp,
    )

    with Session(engine) as session:
        session.add(new_record)
        session.commit()
        session.refresh(new_record)

    return TaskResponse(
        success=True,
        message="Task created successfully",
        task=task_record_to_model(new_record)
    )

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_update: TaskUpdate):
    """Update a task"""
    with Session(engine) as session:
        task_record = get_task_by_id(session, task_id)
        if not task_record:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")

        if task_update.status and task_update.status in ["pending", "in-progress", "completed"]:
            task_record.status = task_update.status
            task_record.updated_at = datetime.datetime.now().isoformat()

        session.add(task_record)
        session.commit()
        session.refresh(task_record)

        return TaskResponse(
            success=True,
            message="Task updated successfully",
            task=task_record_to_model(task_record),
        )

@app.delete("/tasks/{task_id}", response_model=TaskResponse)
async def delete_task(task_id: str):
    """Delete a task"""
    with Session(engine) as session:
        task_record = get_task_by_id(session, task_id)
        if not task_record:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")

        session.delete(task_record)
        session.commit()

    return TaskResponse(
        success=True,
        message=f"Task {task_id} deleted successfully",
        task_id=task_id,
    )

@app.get("/ai-insights", response_model=dict)
async def get_ai_insights():
    """Get AI-powered productivity insights"""
    with Session(engine) as session:
        tasks = load_tasks(session)
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.status == "completed"])
        pending_tasks = total_tasks - completed_tasks

    if not AI_AVAILABLE:
        return {
            "success": False,
            "ai_insight": "AI insights not available - using fallback mode",
            "suggestions": ["Complete high-priority tasks first", "Take breaks between work sessions"],
            "ai_available": False
        }
    
    try:
        # Create Jac script for insights
        jac_script = f'''
import from byllm.llm {{ Model }}

glob llm = Model(model_name="gemini/gemini-2.0-flash");

def generate_insight(total: int, completed: int, pending: int) -> str by llm();

with entry {{
    insight_prompt = "Based on these productivity stats, provide a brief insight and one actionable suggestion: Total tasks: {total_tasks}, Completed: {completed_tasks}, Pending: {pending_tasks}. Keep it concise and motivating.";
    
    result = generate_insight({total_tasks}, {completed_tasks}, {pending_tasks});
    print(result);
}}
'''
        
        # Write and execute
        with open("temp_insights.jac", "w") as f:
            f.write(jac_script)
        
        result = jac_machine.run_jac_file("temp_insights.jac")
        
        # Clean up
        try:
            os.remove("temp_insights.jac")
        except:
            pass
        
        if result:
            return {
                "success": True,
                "ai_insight": str(result).strip(),
                "ai_available": True
            }
        else:
            raise Exception("No AI result returned")
            
    except Exception as e:
        print(f"AI insights error: {e}")
        
        # Fallback insights based on completion rate
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        if completion_rate >= 80:
            insight = "🎉 Excellent productivity! You're completing most of your tasks effectively. Keep up the great momentum!"
        elif completion_rate >= 60:
            insight = "👍 Good progress! You're on track. Consider reviewing pending tasks to boost your completion rate further."
        elif completion_rate >= 40:
            insight = "📈 You're making progress! Try breaking down complex tasks into smaller, manageable steps."
        else:
            insight = "🚀 Time to get started! Focus on your highest priority tasks first to build momentum."
        
        return {
            "success": True,
            "ai_insight": insight,
            "ai_available": False,
            "completion_rate": round(completion_rate, 1)
        }

@app.get("/ai-brief", response_model=AIBriefResponse)
async def get_ai_brief():
    """Generate an AI-crafted daily brief combining agenda and recommendations."""
    with Session(engine) as session:
        tasks = load_tasks(session)
        try:
            data = generate_ai_brief(tasks)
            return AIBriefResponse(success=True, data=AIBriefData(**data))
        except Exception as exc:
            print(f"AI brief endpoint error: {exc}")
            fallback = build_fallback_brief(tasks)
            return AIBriefResponse(
                success=False,
                data=AIBriefData(**fallback),
                error=str(exc),
            )

@app.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    """Get task analytics"""
    with Session(engine) as session:
        tasks = load_tasks(session)

    if len(tasks) == 0:
        return AnalyticsResponse(
            success=True,
            analytics={
                "total_tasks": 0,
                "by_category": {},
                "by_priority": {},
                "by_status": {},
                "completion_rate": 0
            }
        )
    
    # Calculate analytics
    by_category = {}
    by_priority = {}
    by_status = {}
    
    for task in tasks:
        by_category[task.category] = by_category.get(task.category, 0) + 1
        by_priority[task.priority] = by_priority.get(task.priority, 0) + 1
        by_status[task.status] = by_status.get(task.status, 0) + 1
    
    completed = by_status.get("completed", 0)
    completion_rate = (completed / len(tasks)) * 100 if len(tasks) > 0 else 0
    
    return AnalyticsResponse(
        success=True,
        analytics={
            "total_tasks": len(tasks),
            "by_category": by_category,
            "by_priority": by_priority, 
            "by_status": by_status,
            "completion_rate": round(completion_rate, 2)
        }
    )

# Initialize sample data
@app.on_event("startup")
async def startup_event():
    """Initialize the application with sample data"""
    print("🚀 Starting AI Task Manager API...")
    print("✅ FastAPI server initialized")
    print("🤖 AI Integration:", "Jac Language" if AI_AVAILABLE else "Fallback Pattern Matching")
    print("📊 CORS enabled for frontend integration")
    print("🔥 API Documentation: http://localhost:8000/docs")

    SQLModel.metadata.create_all(engine)
    seeded = False
    with Session(engine) as session:
        existing_count = get_task_count(session)
        if existing_count == 0:
            seeded = True
            sample_tasks = [
                "Complete quarterly report for Q4",
                "Buy groceries for the week",
                "Call mom for her birthday",
                "Fix critical bug in authentication system",
                "Schedule dentist appointment",
            ]

            for content in sample_tasks:
                ai_result = categorize_task_with_ai(content)
                now_iso = datetime.datetime.now().isoformat()
                record = TaskRecord(
                    id=str(uuid.uuid4()),
                    content=content,
                    category=ai_result["category"],
                    priority=ai_result["priority"],
                    status="pending",
                    ai_reasoning=ai_result["reasoning"],
                    ai_confidence=ai_result.get("confidence"),
                    ai_tags=[str(tag) for tag in ai_result.get("tags", [])],
                    created_at=now_iso,
                    updated_at=now_iso,
                )
                session.add(record)
                print(f"📝 Created sample task: {content}")

            session.commit()
            existing_count = get_task_count(session)

    if seeded:
        print(f"🎉 Initialized with {existing_count} sample tasks")
    else:
        print(f"ℹ️ Existing tasks detected: {existing_count} task(s) retained")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("UVICORN_RELOAD", "false").lower() in {"1", "true", "yes"},
    )