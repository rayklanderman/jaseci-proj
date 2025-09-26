"""AI Task Manager - Complete Service-Ready Application
Demonstrates Step 5 (Service Deployment) + Step 6 (AI Integration)"""

import random;

# AI-powered categorization function
def categorize_task(description: str) -> str {
    if description.find("meeting") >= 0 or description.find("report") >= 0 or description.find("project") >= 0 {
        return "Work";
    } elif description.find("buy") >= 0 or description.find("grocery") >= 0 or description.find("shopping") >= 0 {
        return "Personal";
    } elif description.find("run") >= 0 or description.find("exercise") >= 0 or description.find("gym") >= 0 {
        return "Health";
    } elif description.find("read") >= 0 or description.find("study") >= 0 or description.find("learn") >= 0 {
        return "Learning";
    } else {
        return "General";
    }
}

# AI insight generation
def get_ai_insight(completed_count: int, pending_count: int) -> str {
    if pending_count == 0 and completed_count > 0 {
        return "🎉 Perfect! All tasks completed. Time to set new goals!";
    } elif completed_count >= pending_count {
        return "📈 Excellent progress! You're completing tasks efficiently.";
    } else {
        return "🎯 Focus opportunity! Consider tackling your pending tasks.";
    }
}

# Service-ready walker for all task operations
walker TaskManager {
    has action: str;
    has description: str = "";
    has task_id: int = 0;
    
    can start with `root entry {
        # Ensure task hub exists
        if not [root --> (`?task_hub)] {
            root ++> task_hub(name="AI Task Center");
        }
        visit [root --> (`?task_hub)];
    }
    
    can process with task_hub entry {
        if self.action == "create" {
            # AI categorization
            category = categorize_task(self.description);
            new_id = random.randint(1000, 9999);
            
            # Create task
            here ++> task(
                description=self.description,
                category=category,
                task_id=new_id,
                completed=False
            );
            
            print(f"✅ Created: '{self.description}' → {category}");
            return {"created": new_id, "category": category};
            
        } elif self.action == "complete" {
            # Complete specific task
            for task_node in [here --> (`?task)] {
                if task_node.task_id == self.task_id {
                    task_node.completed = True;
                    print(f"✓ Completed: {task_node.description}");
                    return {"completed": self.task_id};
                }
            }
            print(f"❌ Task {self.task_id} not found");
            return {"error": "not_found"};
            
        } elif self.action == "list" {
            # List all tasks with AI insights
            all_tasks = [here --> (`?task)];
            pending = [];
            completed = [];
            
            for task_node in all_tasks {
                info = {
                    "id": task_node.task_id,
                    "desc": task_node.description,
                    "cat": task_node.category
                };
                if task_node.completed {
                    completed.append(info);
                } else {
                    pending.append(info);
                }
            }
            
            # Generate AI insight
            insight = get_ai_insight(len(completed), len(pending));
            
            print("📋 Task Overview:");
            print(f"🔄 Pending: {len(pending)}");
            for p in pending {
                print(f"   {p['id']} | {p['cat']} | {p['desc']}");
            }
            print(f"✅ Completed: {len(completed)}");
            print(f"🤖 AI Insight: {insight}");
            
            return {
                "pending": len(pending),
                "completed": len(completed),
                "insight": insight
            };
        }
        return {"error": "unknown_action"};
    }
}

# Task management nodes
node task_hub {
    has name: str;
}

node task {
    has description: str;
    has category: str;
    has task_id: int;
    has completed: bool = False;
}

# CLI Demo & Service Test
with entry:__main__ {
    print("🤖 AI-Powered Personal Task Manager");
    print("=" * 45);
    print("✨ Features:");
    print("  🧠 AI-powered categorization");
    print("  📊 Smart productivity insights");  
    print("  🚀 Service-ready architecture");
    print("  ☁️  Same code: CLI or Cloud!");
    print("");

    # Demo the AI features
    print("📝 Creating AI-categorized tasks...");
    
    root spawn TaskManager(action="create", description="Finish quarterly report");
    root spawn TaskManager(action="create", description="Buy fresh vegetables");  
    root spawn TaskManager(action="create", description="Complete morning run");
    root spawn TaskManager(action="create", description="Read ML research paper");
    
    print(f"\n📊 Task Summary:");
    root spawn TaskManager(action="list");
    
    print(f"\n✅ Completing a task...");
    root spawn TaskManager(action="complete", task_id=1234);  # Demo - will show "not found"
    
    print(f"\n📊 Final Status:");
    root spawn TaskManager(action="list");
    
    print(f"\n🎉 Application Demo Complete!");
    print(f"🚀 Ready for cloud deployment!");
    print(f"   • Run: jac serve task_manager_final.jac");
    print(f"   • Walkers become REST API endpoints");
    print(f"   • AI features work in cloud too!");
}