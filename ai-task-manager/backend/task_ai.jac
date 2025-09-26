"""
Task AI Analysis Module
Uses byllm with Gemini API for intelligent task categorization and insights
"""

import from byllm.llm { Model }

# Initialize Gemini model (using the correct model name)
glob llm = Model(model_name="gemini/gemini-2.0-flash");

# AI function for task categorization with reasoning
def categorize_task(task_content: str) -> str by llm(method='Reason');

# AI function for priority assessment  
def assess_priority(task_content: str, category: str) -> str by llm();

# AI function for generating productivity insights
def generate_productivity_insight(total_tasks: int, completed_tasks: int, pending_tasks: int) -> str by llm();

# Main analysis function that takes a task and returns structured data
def analyze_single_task(task_description: str) -> str {
    """Analyze a single task and return structured JSON-like output"""
    
    # Step 1: Categorize the task with reasoning
    category_prompt = f"Categorize this task into one of these categories: work, personal, health, learning. Task: {task_description}. Respond with just the category name.";
    category_result = categorize_task(category_prompt);
    
    # Step 2: Assess priority
    priority_prompt = f"What priority should this task have: high, medium, or low? Task: {task_description}. Respond with just the priority level.";
    priority_result = assess_priority(priority_prompt, category_result);
    
    # Step 3: Generate reasoning
    reasoning_prompt = f"Explain in one sentence why this task should be categorized as '{category_result}' with '{priority_result}' priority: {task_description}";
    reasoning_result = categorize_task(reasoning_prompt);
    
    # Return structured output
    return f"CATEGORY:{category_result}|PRIORITY:{priority_result}|REASONING:{reasoning_result}";
}

# Analytics insight function
def analyze_productivity(total: int, completed: int, pending: int) -> str {
    """Generate productivity insights based on task statistics"""
    
    insight_prompt = f"Analyze this productivity data: {total} total tasks, {completed} completed, {pending} pending. Provide a brief insight and suggestion for improvement.";
    return generate_productivity_insight(total, completed, pending);
}