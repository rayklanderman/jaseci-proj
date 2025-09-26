"""
AI Task Manager Backend
FastAPI server with Jac integration and AI-powered task categorization
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime
import uuid
import os

# Jac Integration - Import AI capabilities
try:
    from jaclang.core.llms import Anthropic
    llm = Anthropic(model_name='claude-3-5-sonnet-20241022')
    AI_AVAILABLE = True
    print("✅ Jac AI integration loaded successfully")
except Exception as e:
    print(f"⚠️ Jac AI integration failed, using fallback: {e}")
    AI_AVAILABLE = False

app = FastAPI(
    title="🤖 AI Task Manager API",
    description="AI-powered task management with intelligent categorization using Jac language integration",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
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

# Global storage (in production, use database)
tasks_storage: List[Task] = []

def categorize_task_with_ai(content: str) -> dict:
    """AI-powered task categorization using Jac integration"""
    if AI_AVAILABLE:
        try:
            prompt = f"""Categorize this task into one of: work, personal, urgent, later
Also assign priority: high, medium, low
Task: {content}
Respond in JSON format: {{"category": "category", "priority": "priority", "reasoning": "explanation"}}"""
            
            response = llm.predict(prompt)
            
            # Simple parsing (in production, use proper JSON parsing)
            category = "later"
            priority = "medium"
            reasoning = f"AI Analysis: {response}"
            
            if "work" in response.lower():
                category = "work"
            elif "urgent" in response.lower():
                category = "urgent"  
            elif "personal" in response.lower():
                category = "personal"
                
            if "high" in response.lower():
                priority = "high"
            elif "low" in response.lower():
                priority = "low"
                
            return {
                "category": category,
                "priority": priority,
                "reasoning": reasoning
            }
        except Exception as e:
            print(f"AI categorization failed: {e}")
    
    # Fallback categorization
    fallback_categories = {
        "work": ["project", "meeting", "report", "email", "deadline", "client"],
        "personal": ["buy", "call", "visit", "appointment", "exercise", "health"],
        "urgent": ["asap", "urgent", "immediately", "emergency", "critical", "now"]
    }
    
    content_lower = content.lower()
    category = "later"
    priority = "medium"
    
    for cat, keywords in fallback_categories.items():
        if any(keyword in content_lower for keyword in keywords):
            category = cat
            break
    
    if category == "urgent" or any(word in content_lower for word in ["urgent", "asap", "critical"]):
        priority = "high"
    elif len(content) < 20:
        priority = "low"
        
    return {
        "category": category,
        "priority": priority,
        "reasoning": "Pattern-based categorization (fallback)"
    }

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
    return {
        "status": "healthy",
        "service": "AI Task Manager",
        "ai_available": AI_AVAILABLE,
        "tasks_count": len(tasks_storage),
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/HealthCheck")
async def health_check_frontend():
    """Health check endpoint for frontend (capitalized)"""
    return {
        "status": "healthy",
        "service": "AI Task Manager", 
        "ai_available": AI_AVAILABLE,
        "tasks_count": len(tasks_storage),
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/tasks", response_model=TaskResponse)
async def get_tasks():
    """Get all tasks"""
    return TaskResponse(
        success=True,
        tasks=tasks_storage,
        total=len(tasks_storage)
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
    new_task = Task(
        id=task_id,
        content=task_data.content.strip(),
        category=ai_result["category"],
        priority=ai_result["priority"],
        status="pending",
        ai_reasoning=ai_result["reasoning"],
        created_at=timestamp,
        updated_at=timestamp
    )
    
    tasks_storage.append(new_task)
    
    return TaskResponse(
        success=True,
        message="Task created successfully",
        task=new_task
    )

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_update: TaskUpdate):
    """Update a task"""
    task = next((t for t in tasks_storage if t.id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    
    # Update task
    if task_update.status and task_update.status in ["pending", "in-progress", "completed"]:
        task.status = task_update.status
        task.updated_at = datetime.datetime.now().isoformat()
    
    return TaskResponse(
        success=True,
        message="Task updated successfully",
        task=task
    )

@app.delete("/tasks/{task_id}", response_model=TaskResponse)
async def delete_task(task_id: str):
    """Delete a task"""
    global tasks_storage
    original_count = len(tasks_storage)
    tasks_storage = [t for t in tasks_storage if t.id != task_id]
    
    if len(tasks_storage) == original_count:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    
    return TaskResponse(
        success=True,
        message=f"Task {task_id} deleted successfully"
    )

@app.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    """Get task analytics"""
    if len(tasks_storage) == 0:
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
    
    for task in tasks_storage:
        by_category[task.category] = by_category.get(task.category, 0) + 1
        by_priority[task.priority] = by_priority.get(task.priority, 0) + 1
        by_status[task.status] = by_status.get(task.status, 0) + 1
    
    completed = by_status.get("completed", 0)
    completion_rate = (completed / len(tasks_storage)) * 100 if len(tasks_storage) > 0 else 0
    
    return AnalyticsResponse(
        success=True,
        analytics={
            "total_tasks": len(tasks_storage),
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
    
    # Create sample tasks
    sample_tasks = [
        "Complete quarterly report for Q4",
        "Buy groceries for the week", 
        "Call mom for her birthday",
        "Fix critical bug in authentication system",
        "Schedule dentist appointment"
    ]
    
    for content in sample_tasks:
        ai_result = categorize_task_with_ai(content)
        task = Task(
            id=str(uuid.uuid4()),
            content=content,
            category=ai_result["category"],
            priority=ai_result["priority"],
            status="pending",
            ai_reasoning=ai_result["reasoning"],
            created_at=datetime.datetime.now().isoformat(),
            updated_at=datetime.datetime.now().isoformat()
        )
        tasks_storage.append(task)
        print(f"📝 Created sample task: {content}")
    
    print(f"🎉 Initialized with {len(tasks_storage)} sample tasks")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)