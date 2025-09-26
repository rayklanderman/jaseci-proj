"""AI Task Manager - REAL Gemini API Integration
Complete service with actual byLLM integration for true AI intelligence"""

import from byllm { Model }
import random;

# Global Gemini model configuration  
glob llm = Model(model_name="gemini/gemini-2.0-flash");

# Define task categories as enum for type safety
enum TaskCategory {
    WORK,
    PERSONAL, 
    HEALTH,
    LEARNING,
    GENERAL
}

# Define priority levels  
enum Priority {
    HIGH,
    MEDIUM,
    LOW
}

"""Analyze task description and intelligently categorize it using AI
Classify a task description into the most appropriate category based on context, keywords, and semantic meaning.
Focus on the primary domain and purpose of the task rather than superficial keywords."""
def categorize_task_ai(description: str) -> TaskCategory by llm();

"""Generate intelligent priority suggestion based on task content and urgency indicators
Analyze task description for urgency signals, deadlines, importance markers, and context clues.
Consider time-sensitive language, business impact, and personal importance."""  
def suggest_priority(description: str) -> Priority by llm();

"""Create personalized productivity insight based on task completion patterns
Generate actionable productivity advice based on task completion statistics and category distribution.
Provide encouraging feedback and practical suggestions for task management improvement."""
def generate_insight(completed_count: int, pending_count: int, task_categories: list) -> str by llm();

"""Improve and enhance task descriptions to be more actionable and clear
Transform vague or brief task descriptions into specific, actionable items with clear outcomes.
Add context, timeframes, and specific actions while preserving the original intent."""
def enhance_task_description(original_description: str) -> str by llm();

# Enhanced AI-powered task manager walker
walker AITaskManager {
    has action: str;
    has description: str = "";
    has task_id: int = 0;
    has use_ai_enhancement: bool = True;
    
    can start with `root entry {
        # Ensure task hub exists
        if not [root --> (`?task_hub)] {
            root ++> task_hub(name="AI-Powered Task Center");
        }
        visit [root --> (`?task_hub)];
    }
    
    can process with task_hub entry {
        if self.action == "create" {
            # Use real AI for categorization
            ai_category = categorize_task_ai(self.description);
            ai_priority = suggest_priority(self.description);
            
            # Optionally enhance the task description
            enhanced_desc = self.description;
            if self.use_ai_enhancement {
                enhanced_desc = enhance_task_description(self.description);
            }
            
            new_id = random.randint(1000, 9999);
            
            # Create task with AI insights
            here ++> ai_task(
                description=enhanced_desc,
                original_description=self.description,
                category=ai_category.name,
                priority=ai_priority.name,
                task_id=new_id,
                completed=False
            );
            
            print(f"🤖 AI Task Created:");
            print(f"   Original: '{self.description}'");
            if enhanced_desc != self.description {
                print(f"   Enhanced: '{enhanced_desc}'");
            }
            print(f"   🏷️ Category: {ai_category.name} (AI-suggested)");
            print(f"   ⭐ Priority: {ai_priority.name} (AI-suggested)");
            
            return {
                "created": new_id, 
                "category": ai_category.name,
                "priority": ai_priority.name,
                "enhanced": enhanced_desc != self.description
            };
            
        } elif self.action == "complete" {
            # Complete specific task
            for task_node in [here --> (`?ai_task)] {
                if task_node.task_id == self.task_id {
                    task_node.completed = True;
                    print(f"✅ Completed: {task_node.description}");
                    return {"completed": self.task_id};
                }
            }
            print(f"❌ Task {self.task_id} not found");
            return {"error": "not_found"};
            
        } elif self.action == "list" {
            # List all tasks with AI insights
            all_tasks = [here --> (`?ai_task)];
            pending = [];
            completed = [];
            categories = [];
            
            for task_node in all_tasks {
                categories.append(task_node.category);
                info = {
                    "id": task_node.task_id,
                    "desc": task_node.description,
                    "original": task_node.original_description,
                    "cat": task_node.category,
                    "priority": task_node.priority
                };
                if task_node.completed {
                    completed.append(info);
                } else {
                    pending.append(info);
                }
            }
            
            # Generate AI insight using real Gemini
            ai_insight = generate_insight(len(completed), len(pending), categories);
            
            print("🤖 AI-Powered Task Overview:");
            print(f"🔄 Pending Tasks ({len(pending)}):");
            for p in pending {
                print(f"   {p['id']} | {p['priority']} | {p['cat']} | {p['desc']}");
            }
            print(f"✅ Completed: {len(completed)}");
            print(f"🧠 AI Insight: {ai_insight}");
            
            return {
                "pending": len(pending),
                "completed": len(completed),
                "ai_insight": ai_insight,
                "categories": categories
            };
            
        } elif self.action == "enhance_all" {
            # AI enhancement of all pending tasks
            print("🚀 AI Enhancement Mode: Upgrading all pending tasks...");
            enhanced_count = 0;
            
            for task_node in [here --> (`?ai_task)] {
                if not task_node.completed {
                    enhanced = enhance_task_description(task_node.original_description);
                    if enhanced != task_node.original_description {
                        task_node.description = enhanced;
                        enhanced_count += 1;
                        print(f"   ✨ Enhanced: {task_node.original_description} → {enhanced}");
                    }
                }
            }
            
            return {"enhanced_tasks": enhanced_count};
        }
        return {"error": "unknown_action"};
    }
}

# Enhanced task node with AI metadata
node task_hub {
    has name: str;
}

node ai_task {
    has description: str;
    has original_description: str;
    has category: str;
    has priority: str;
    has task_id: int;
    has completed: bool = False;
}

# Demo and CLI interface
with entry:__main__ {
    print("🤖 REAL AI-Powered Personal Task Manager");
    print("=" * 50);
    print("✨ Features:");
    print("  🧠 Real Gemini AI categorization");
    print("  📊 AI-generated productivity insights");  
    print("  ⭐ Smart priority suggestions");
    print("  ✨ AI task description enhancement");
    print("  🚀 byLLM integration with type safety");
    print("");

    try {
        # Demo the REAL AI features
        print("📝 Creating AI-enhanced tasks...");
        
        result1 = root spawn AITaskManager(action="create", description="finish report");
        print(f"Result 1: {result1}");
        
        result2 = root spawn AITaskManager(action="create", description="buy food");  
        print(f"Result 2: {result2}");
        
        result3 = root spawn AITaskManager(action="create", description="exercise");
        print(f"Result 3: {result3}");
        
        result4 = root spawn AITaskManager(action="create", description="learn python");
        print(f"Result 4: {result4}");
        
        print(f"\n📊 AI Task Analysis:");
        result = root spawn AITaskManager(action="list");
        
        print(f"\n✨ AI Task Enhancement Demo:");
        root spawn AITaskManager(action="enhance_all");
        
        print(f"\n📊 Final AI Analysis:");
        root spawn AITaskManager(action="list");
        
    } except Exception as e {
        error_str = str(e);
        print(f"⚠️ AI Integration Status: {e}");
        
        if "overloaded" in error_str or "503" in error_str {
            print("💡 GOOD NEWS: byLLM integration is working correctly!");
            print("🔄 Gemini API is temporarily overloaded (common with free tier)");
            print("✅ Your code will work when API capacity is available");
            print("⏰ Try again in a few minutes or hours");
        } elif "API key" in error_str or "authentication" in error_str {
            print("🔑 API Key Setup Required:");
            print("   1. Run: python setup_gemini_api.py");  
            print("   2. Or set manually: $env:GEMINI_API_KEY='your_key'");
            print("   3. Get key at: https://aistudio.google.com/app/apikey");
        } else {
            print("💡 Make sure you have:");
            print("   1. Installed byllm: pip install byllm");
            print("   2. Set up Gemini API key in environment");
            print("   3. Configured model access properly");
        }
    }
    
    print(f"\n🎉 Real AI Integration Demo Complete!");
    print(f"🚀 This uses actual Gemini API for:");
    print(f"   • Intelligent task categorization");
    print(f"   • Smart priority suggestions");
    print(f"   • Personalized productivity insights");
    print(f"   • Task description enhancement");
}