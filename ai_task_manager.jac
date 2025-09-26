"""AI-Powered Personal Task Manager - Advanced Jac Application"""

import random;

# AI-powered task categorization and insights
"""Analyze a task description and suggest the most appropriate category"""
def categorize_task(task_description: str) -> str {
    # Enhanced AI-style categorization (ready for byLLM integration)
    keywords_work = ["meeting", "email", "report", "project", "deadline", "presentation"];
    keywords_personal = ["buy", "call", "doctor", "appointment", "birthday", "family"];
    keywords_health = ["exercise", "gym", "run", "walk", "meditation", "diet"];
    keywords_learning = ["read", "study", "course", "learn", "practice", "research"];
    
    task_lower = task_description.lower();
    
    work_score = sum([1 for keyword in keywords_work if keyword in task_lower]);
    personal_score = sum([1 for keyword in keywords_personal if keyword in task_lower]);
    health_score = sum([1 for keyword in keywords_health if keyword in task_lower]);
    learning_score = sum([1 for keyword in keywords_learning if keyword in task_lower]);
    
    scores = {"Work": work_score, "Personal": personal_score, "Health": health_score, "Learning": learning_score};
    
    # Find category with highest score
    max_category = "General";
    max_score = 0;
    for category in scores {
        if scores[category] > max_score {
            max_score = scores[category];
            max_category = category;
        }
    }
    
    if max_score > 0 {
        return max_category;
    } else {
        return "General";
    }
}

"""Generate AI-powered productivity insight based on task completion patterns"""
def generate_productivity_insight(completed_tasks: int, pending_tasks: int) -> str {
    completion_rate = completed_tasks / (completed_tasks + pending_tasks) if (completed_tasks + pending_tasks) > 0 else 0;
    
    if completion_rate >= 0.8 {
        insights = [
            "🎯 Exceptional productivity! You're completing 80%+ of your tasks. Consider taking on more challenging goals.",
            "⭐ Outstanding performance! Your high completion rate shows excellent focus and time management.",
            "🚀 You're in the productivity zone! Your task completion pattern indicates peak performance."
        ];
    } elif completion_rate >= 0.6 {
        insights = [
            "📈 Good progress! You're maintaining a solid completion rate. Consider optimizing your task prioritization.",
            "💪 Steady performer! Your completion rate shows consistent effort. Try batching similar tasks for efficiency.",
            "🎲 Balanced approach! Your task management is on track. Focus on your highest-impact items first."
        ];
    } else {
        insights = [
            "🎯 Growth opportunity! Consider breaking large tasks into smaller, manageable chunks.",
            "🧠 Strategic adjustment needed! Try prioritizing 3 key tasks per day for better focus.",
            "💡 Optimization time! Consider using time-blocking techniques to boost your completion rate."
        ];
    }
    
    return insights[random.randint(0, len(insights) - 1)];
}

# Walker for managing individual tasks
walker TaskManager {
    has action: str;
    has task_description: str = "";
    has task_id: int = 0;
    
    can start with `root entry {
        print(f"🎯 TaskManager initiated: {self.action}");
        visit [-->];
    }
    
    can create_task with task_hub entry {
        print(f"📝 Creating new task: '{self.task_description}'");
        
        # AI-powered categorization
        category = categorize_task(self.task_description);
        
        # Generate unique task ID
        task_id = random.randint(1000, 9999);
        
        # Create new task node
        new_task = here ++> task(
            description=self.task_description,
            category=category,
            priority="Medium",
            task_id=task_id,
            completed=False
        );
        
        print(f"✅ Task created successfully!");
        print(f"   📂 Category: {category} (AI-suggested)");
        print(f"   🆔 Task ID: {task_id}");
        
        return {"action": "created", "task_id": task_id, "category": category};
    }
    
    can complete_task with task_hub entry {
        print(f"✅ Attempting to complete task ID: {self.task_id}");
        
        # Find the specific task
        task_found = False;
        for task_node in [here --> (`?task)] {
            if task_node.task_id == self.task_id {
                task_node.completed = True;
                task_found = True;
                print(f"🎉 Task completed: '{task_node.description}'");
                break;
            }
        }
        
        if not task_found {
            print(f"❌ Task ID {self.task_id} not found");
            return {"action": "error", "message": "Task not found"};
        }
        
        return {"action": "completed", "task_id": self.task_id};
    }
    
    can list_tasks with task_hub entry {
        print("📋 Your Current Tasks:");
        print("=" * 50);
        
        all_tasks = [here --> (`?task)];
        pending_tasks = [];
        completed_tasks = [];
        
        # Separate pending and completed tasks
        for task_node in all_tasks {
            if task_node.completed {
                completed_tasks.append(task_node);
            } else {
                pending_tasks.append(task_node);
            }
        }
        
        if len(pending_tasks) > 0 {
            print("🔄 PENDING TASKS:");
            for task_item in pending_tasks {
                print(f"   🆔 {task_item.task_id} | 📂 {task_item.category} | {task_item.description}");
            }
        } else {
            print("🎉 No pending tasks! Great job!");
        }
        
        if len(completed_tasks) > 0 {
            print(f"\n✅ COMPLETED TASKS ({len(completed_tasks)}):");
            for i in range(min(3, len(completed_tasks))) {  # Show last 3 completed
                task_item = completed_tasks[i];
                print(f"   ✓ {task_item.task_id} | 📂 {task_item.category} | {task_item.description}");
            }
        }
        
        # AI-powered productivity insight
        insight = generate_productivity_insight(len(completed_tasks), len(pending_tasks));
        print(f"\n🤖 AI Insight: {insight}");
        
        return {"pending": len(pending_tasks), "completed": len(completed_tasks)};
    }
}

# Central hub for all tasks
node task_hub {
    has name: str = "Personal Task Center";
}

# Individual task nodes
node task {
    has description: str;
    has category: str;
    has priority: str;
    has task_id: int;
    has completed: bool = False;
}

# CLI demonstration mode
with entry:__main__ {
    print("🎯 AI-Powered Personal Task Manager");
    print("=" * 45);
    print("🤖 Features: AI Categorization + Smart Insights");
    print("🚀 Architecture: Service-Ready Walker System");
    print("");
    
    # Initialize the task hub
    root ++> task_hub();
    
    # Demo: Create some tasks
    print("📝 Creating sample tasks...");
    root spawn TaskManager(action="create", task_description="Finish quarterly sales report");
    root spawn TaskManager(action="create", task_description="Buy groceries for dinner");
    root spawn TaskManager(action="create", task_description="Go for a 30-minute run");
    root spawn TaskManager(action="create", task_description="Read chapter 5 of ML book");
    
    print("\n" + "="*50);
    
    # Demo: List all tasks
    result = root spawn TaskManager(action="list");
    
    print("\n" + "="*50);
    
    # Demo: Complete a task
    print("✅ Completing a task...");
    root spawn TaskManager(action="complete", task_id=1000);  # This will show "not found" demo
    
    print("\n🎉 Demo Complete! This same code can run as a cloud service!");
}