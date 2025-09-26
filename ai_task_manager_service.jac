"""AI-Powered Personal Task Manager - Service-Ready Version"""

import random;

# AI-powered task categorization and insights (ready for byLLM integration)
def categorize_task(task_description: str) -> str {
    # Simple AI categorization based on keywords
    if task_description.find("meeting") != -1 or task_description.find("report") != -1 or task_description.find("project") != -1 or task_description.find("presentation") != -1 {
        return "Work";
    } elif task_description.find("buy") != -1 or task_description.find("grocery") != -1 or task_description.find("shopping") != -1 {
        return "Personal";
    } elif task_description.find("run") != -1 or task_description.find("exercise") != -1 or task_description.find("gym") != -1 or task_description.find("workout") != -1 {
        return "Health";
    } elif task_description.find("read") != -1 or task_description.find("study") != -1 or task_description.find("learn") != -1 or task_description.find("book") != -1 {
        return "Learning";
    } else {
        return "General";
    }
}

def generate_productivity_insight(completed: int, pending: int) -> str {
    # Generate AI-powered productivity insight based on task completion patterns
    total = completed + pending;
    if total == 0 {
        return "🎯 Ready to start your productivity journey!";
    }
    
    rate = completed;  # Simplified for now
    if rate >= 2 {
        return "🎯 Excellent productivity! You're making great progress.";
    } elif rate >= 1 {
        return "📈 Good progress! You're maintaining steady completion.";
    } else {
        return "🎯 Growth opportunity! Consider breaking tasks into smaller chunks.";
    }
}

# Service-ready walker for task operations
walker TaskService {
    has action: str;
    has task_description: str = "";
    has task_id: int = 0;
    
    can start with `root entry {
        if not [root --> (`?task_hub)] {
            # Initialize task hub if it doesn't exist
            hub = root ++> task_hub(name="Task Center");
            visit hub;
        } else {
            visit [root --> (`?task_hub)];
        }
    }
    
    can handle_request with task_hub entry {
        if self.action == "create" {
            # AI-powered categorization
            category = categorize_task(self.task_description);
            task_id = random.randint(1000, 9999);
            
            # Create new task node
            here ++> task(
                description=self.task_description,
                category=category,
                priority="Medium",
                task_id=task_id,
                completed=False
            );
            
            return {
                "action": "task_created",
                "task_id": task_id,
                "description": self.task_description,
                "category": category
            };
        } elif self.action == "complete" {
            # Find and complete the specific task
            for task_node in [here --> (`?task)] {
                if task_node.task_id == self.task_id {
                    task_node.completed = True;
                    return {
                        "action": "task_completed",
                        "task_id": self.task_id,
                        "description": task_node.description
                    };
                }
            }
            return {"error": "Task not found", "task_id": self.task_id};
        } elif self.action == "list" {
            all_tasks = [here --> (`?task)];
            pending_tasks = [];
            completed_tasks = [];
            
            # Separate tasks by status
            for task_node in all_tasks {
                task_info = {
                    "id": task_node.task_id,
                    "description": task_node.description,
                    "category": task_node.category,
                    "priority": task_node.priority
                };
                if task_node.completed {
                    completed_tasks.append(task_info);
                } else {
                    pending_tasks.append(task_info);
                }
            }
            
            # Generate AI insight
            insight = generate_productivity_insight(len(completed_tasks), len(pending_tasks));
            
            return {
                "action": "tasks_listed",
                "pending_tasks": pending_tasks,
                "completed_tasks": completed_tasks,
                "stats": {
                    "total_pending": len(pending_tasks),
                    "total_completed": len(completed_tasks)
                },
                "ai_insight": insight
            };
        } else {
            return {"error": "Unknown action", "action": self.action};
        }
    }
}

# Central hub for all tasks
node task_hub {
    has name: str = "Task Management Hub";
}

# Individual task nodes
node task {
    has description: str;
    has category: str;
    has priority: str;
    has task_id: int;
    has completed: bool = False;
}

# CLI mode demonstration
with entry:__main__ {
    print("🤖 AI-Powered Personal Task Manager");
    print("=" * 50);
    print("🚀 Service-Ready Architecture | 🧠 AI-Enhanced");
    print("💡 Same code runs CLI or cloud service!");
    print("");
    
    # Demo 1: Create tasks
    print("📝 Creating AI-categorized tasks...");
    result1 = root spawn TaskService(action="create", task_description="Prepare quarterly presentation");
    print(f"✅ Created: {result1.description} → Category: {result1.category}");
    
    result2 = root spawn TaskService(action="create", task_description="Buy organic vegetables");
    print(f"✅ Created: {result2.description} → Category: {result2.category}");
    
    result3 = root spawn TaskService(action="create", task_description="Complete 5K morning run");
    print(f"✅ Created: {result3.description} → Category: {result3.category}");
    
    # Demo 2: List tasks with AI insights
    print(f"\n📋 Task Overview:");
    list_result = root spawn TaskService(action="list");
    
    print(f"🔄 Pending: {list_result.stats.total_pending} tasks");
    for task_info in list_result.pending_tasks {
        print(f"   🆔 {task_info.id} | 📂 {task_info.category} | {task_info.description}");
    }
    
    print(f"\n🤖 AI Insight: {list_result.ai_insight}");
    
    # Demo 3: Complete a task
    if len(list_result.pending_tasks) > 0 {
        first_task = list_result.pending_tasks[0];
        print(f"\n✅ Completing task: {first_task.description}");
        complete_result = root spawn TaskService(action="complete", task_id=first_task.id);
        print(f"   ✓ Status: {complete_result.action}");
        
        # Show updated stats
        updated_list = root spawn TaskService(action="list");
        print(f"\n📊 Updated Stats:");
        print(f"   Completion Rate: {int(updated_list.stats.completion_rate * 100)}%");
        print(f"   🤖 New Insight: {updated_list.ai_insight}");
    }
    
    print(f"\n🎉 Demo Complete!");
    print(f"🚀 Ready for cloud deployment with 'jac serve ai_task_manager_service.jac'");
}