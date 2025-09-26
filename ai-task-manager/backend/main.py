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
import subprocess
import sys

# Jac Integration - Import AI capabilities
try:
    from jaclang import JacMachine
    import os
    
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
    """AI-powered task categorization using Jac byllm integration"""
    if AI_AVAILABLE:
        try:
            # Create a dynamic Jac script that analyzes the specific task
            jac_script = f'''
import from byllm.llm {{ Model }}

glob llm = Model(model_name="gemini/gemini-2.0-flash");

def analyze_single_task(task_description: str) -> str by llm(method='Reason');

with entry {{
    task = "{content.replace('"', '\\"')}";
    
    # Create structured prompt for analysis
    prompt = "Analyze this task and respond in this exact format: CATEGORY:category_name|PRIORITY:priority_level|REASONING:explanation\\n\\nTask: " + task + "\\n\\nCategories: work, personal, health, learning\\nPriorities: high, medium, low";
    
    result = analyze_single_task(prompt);
    print(result);
}}
'''
            
            # Write temporary Jac file
            temp_file = "temp_task_analysis.jac"
            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(jac_script)
            
            try:
                # Execute using JacMachine
                result = jac_machine.run_jac_file(temp_file)
                
                # Parse the structured output
                category = "personal"  # default
                priority = "medium"    # default 
                reasoning = "AI analysis completed"
                
                if result and "CATEGORY:" in str(result):
                    output = str(result)
                    
                    # Extract category
                    if "CATEGORY:" in output:
                        category_part = output.split("CATEGORY:")[1].split("|")[0].strip().lower()
                        if category_part in ["work", "personal", "health", "learning"]:
                            category = category_part
                    
                    # Extract priority
                    if "PRIORITY:" in output:
                        priority_part = output.split("PRIORITY:")[1].split("|")[0].strip().lower()
                        if priority_part in ["high", "medium", "low"]:
                            priority = priority_part
                    
                    # Extract reasoning
                    if "REASONING:" in output:
                        reasoning = output.split("REASONING:")[1].strip()
                
                return {
                    "category": category,
                    "priority": priority,
                    "reasoning": f"AI Analysis: {reasoning}"
                }
                
            except Exception as e:
                print(f"Jac execution error: {e}")
                # Try fallback with direct byllm approach
                return categorize_with_simple_byllm(content)
            
            finally:
                # Clean up temp file
                try:
                    os.remove(temp_file)
                except:
                    pass
                    
        except Exception as e:
            print(f"AI categorization failed: {e}")
    
    # Fallback to pattern matching
    return categorize_with_fallback(content)

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
        
        # Simple parsing
        if result and "," in str(result):
            parts = str(result).split(",")
            return {
                "category": parts[0].strip() if len(parts) > 0 else "personal",
                "priority": parts[1].strip() if len(parts) > 1 else "medium", 
                "reasoning": parts[2].strip() if len(parts) > 2 else "AI quick analysis"
            }
            
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
        
    return {
        "category": category,
        "priority": priority,
        "reasoning": f"Pattern matching: Found keywords suggesting '{category}' category with '{priority}' priority"
    }

# Global storage (in production, use database)
tasks_storage: List[Task] = []

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

@app.get("/ai-insights", response_model=dict)
async def get_ai_insights():
    """Get AI-powered productivity insights"""
    if not AI_AVAILABLE:
        return {
            "success": False,
            "ai_insight": "AI insights not available - using fallback mode",
            "suggestions": ["Complete high-priority tasks first", "Take breaks between work sessions"],
            "ai_available": False
        }
    
    try:
        # Calculate current stats
        total_tasks = len(tasks_storage)
        completed_tasks = len([t for t in tasks_storage if t.status == "completed"])
        pending_tasks = total_tasks - completed_tasks
        
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