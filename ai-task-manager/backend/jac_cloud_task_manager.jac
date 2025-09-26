"""
AI Task Manager with Jac Cloud
A cloud-native task management system with AI-powered categorization
"""

import:py from jaclang.core.llms {Anthropic}

glob llm = Anthropic(model_name='claude-3-5-sonnet-20241022');

# Task data structure
obj Task {
    has id: str,
        content: str,
        category: str,
        priority: str,
        status: str = "pending",
        ai_reasoning: str = "",
        created_at: str,
        updated_at: str;
}

# Global task storage (in production, this would be a database)
glob task_storage: list[Task] = [];
glob task_counter: int = 0;

# AI-powered task categorization
walker categorize_task {
    has task_content: str;
    
    can categorize with `root entry {
        # Use AI to categorize the task
        try {
            response = llm.predict(
                f"Categorize this task into one of: work, personal, urgent, later\n"
                f"Also assign priority: high, medium, low\n"
                f"Task: {self.task_content}\n"
                f"Respond in JSON format: {{\"category\": \"category\", \"priority\": \"priority\", \"reasoning\": \"explanation\"}}"
            );
            
            # Parse AI response (simplified - in production would use proper JSON parsing)
            if "work" in response.lower():
                category = "work";
            elif "urgent" in response.lower():
                category = "urgent";
            elif "personal" in response.lower():
                category = "personal";
            else:
                category = "later";
                
            if "high" in response.lower():
                priority = "high";
            elif "low" in response.lower():
                priority = "low";
            else:
                priority = "medium";
                
            reasoning = f"AI Analysis: {response}";
            
            return {
                "category": category,
                "priority": priority,
                "reasoning": reasoning
            };
        } except Exception as e {
            # Fallback categorization
            print(f"AI categorization failed: {e}");
            return {
                "category": "later",
                "priority": "medium", 
                "reasoning": "Fallback categorization used"
            };
        }
    }
}

# API Endpoints as Walkers

# Health check endpoint
walker health_check {
    can check with `root entry {
        return {
            "status": "healthy",
            "service": "AI Task Manager",
            "version": "1.0.0",
            "timestamp": str(__import__('datetime').datetime.now())
        };
    }
}

# Get all tasks
walker get_tasks {
    can fetch with `root entry {
        return {
            "success": True,
            "tasks": [
                {
                    "id": task.id,
                    "content": task.content,
                    "category": task.category,
                    "priority": task.priority,
                    "status": task.status,
                    "ai_reasoning": task.ai_reasoning,
                    "created_at": task.created_at,
                    "updated_at": task.updated_at
                } for task in task_storage
            ],
            "total": len(task_storage)
        };
    }
}

# Create a new task
walker create_task {
    has content: str;
    
    can create with `root entry {
        if not self.content or len(self.content.strip()) == 0 {
            return {
                "success": False,
                "error": "Task content cannot be empty"
            };
        }
        
        # Use AI to categorize the task
        categorizer = spawn here --> categorize_task(task_content=self.content);
        ai_result = categorizer categorize;
        
        # Generate unique ID
        global task_counter;
        task_counter += 1;
        task_id = f"task_{task_counter}";
        
        # Create timestamp
        timestamp = str(__import__('datetime').datetime.now());
        
        # Create new task
        new_task = Task(
            id=task_id,
            content=self.content,
            category=ai_result["category"],
            priority=ai_result["priority"],
            status="pending",
            ai_reasoning=ai_result["reasoning"],
            created_at=timestamp,
            updated_at=timestamp
        );
        
        # Add to storage
        task_storage.append(new_task);
        
        return {
            "success": True,
            "message": "Task created successfully",
            "task": {
                "id": new_task.id,
                "content": new_task.content,
                "category": new_task.category,
                "priority": new_task.priority,
                "status": new_task.status,
                "ai_reasoning": new_task.ai_reasoning,
                "created_at": new_task.created_at,
                "updated_at": new_task.updated_at
            }
        };
    }
}

# Update task status
walker update_task {
    has task_id: str,
        status: str = "";
    
    can update with `root entry {
        if not self.task_id {
            return {
                "success": False,
                "error": "Task ID is required"
            };
        }
        
        # Find task
        target_task = None;
        for task in task_storage {
            if task.id == self.task_id {
                target_task = task;
                break;
            }
        }
        
        if not target_task {
            return {
                "success": False,
                "error": f"Task with ID {self.task_id} not found"
            };
        }
        
        # Update task
        if self.status and self.status in ["pending", "in-progress", "completed"] {
            target_task.status = self.status;
            target_task.updated_at = str(__import__('datetime').datetime.now());
        }
        
        return {
            "success": True,
            "message": "Task updated successfully",
            "task": {
                "id": target_task.id,
                "content": target_task.content,
                "category": target_task.category,
                "priority": target_task.priority,
                "status": target_task.status,
                "ai_reasoning": target_task.ai_reasoning,
                "created_at": target_task.created_at,
                "updated_at": target_task.updated_at
            }
        };
    }
}

# Delete a task
walker delete_task {
    has task_id: str;
    
    can delete with `root entry {
        if not self.task_id {
            return {
                "success": False,
                "error": "Task ID is required"
            };
        }
        
        # Find and remove task
        original_count = len(task_storage);
        global task_storage;
        task_storage = [task for task in task_storage if task.id != self.task_id];
        
        if len(task_storage) == original_count {
            return {
                "success": False,
                "error": f"Task with ID {self.task_id} not found"
            };
        }
        
        return {
            "success": True,
            "message": f"Task {self.task_id} deleted successfully"
        };
    }
}

# Analytics endpoint
walker get_analytics {
    can analyze with `root entry {
        if len(task_storage) == 0 {
            return {
                "success": True,
                "analytics": {
                    "total_tasks": 0,
                    "by_category": {},
                    "by_priority": {},
                    "by_status": {},
                    "completion_rate": 0
                }
            };
        }
        
        # Calculate analytics
        by_category = {};
        by_priority = {};
        by_status = {};
        
        for task in task_storage {
            # Count by category
            if task.category not in by_category {
                by_category[task.category] = 0;
            }
            by_category[task.category] += 1;
            
            # Count by priority
            if task.priority not in by_priority {
                by_priority[task.priority] = 0;
            }
            by_priority[task.priority] += 1;
            
            # Count by status
            if task.status not in by_status {
                by_status[task.status] = 0;
            }
            by_status[task.status] += 1;
        }
        
        # Calculate completion rate
        completed = by_status.get("completed", 0);
        completion_rate = (completed / len(task_storage)) * 100 if len(task_storage) > 0 else 0;
        
        return {
            "success": True,
            "analytics": {
                "total_tasks": len(task_storage),
                "by_category": by_category,
                "by_priority": by_priority,
                "by_status": by_status,
                "completion_rate": round(completion_rate, 2)
            }
        };
    }
}

# Main application setup
walker setup {
    can initialize with `root entry {
        print("🚀 AI Task Manager with Jac Cloud");
        print("✅ Jac Cloud backend initialized");
        print("🤖 AI-powered task categorization ready");
        print("📊 Analytics endpoints available");
        print("🔥 API Documentation: http://localhost:8000/docs");
        
        # Initialize some sample tasks for demonstration
        sample_tasks = [
            "Complete quarterly report for Q4",
            "Buy groceries for the week", 
            "Call mom for her birthday",
            "Fix bug in the authentication system",
            "Schedule dentist appointment"
        ];
        
        for content in sample_tasks {
            creator = spawn here --> create_task(content=content);
            result = creator create;
            if result["success"] {
                print(f"📝 Created sample task: {content}");
            }
        }
        
        print(f"🎉 Initialized with {len(task_storage)} sample tasks");
        
        return {
            "message": "AI Task Manager initialized successfully",
            "endpoints": {
                "health": "/health_check",
                "tasks": "/get_tasks", 
                "create": "/create_task",
                "update": "/update_task",
                "delete": "/delete_task",
                "analytics": "/get_analytics"
            }
        };
    }
}