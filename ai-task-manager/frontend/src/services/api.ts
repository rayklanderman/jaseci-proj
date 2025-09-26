// Local Task Management Service - No backend required!
// This implements all the AI features locally for a fully working app

import type {
  Task,
  TaskResponse,
  TaskListResponse,
  HealthCheckResponse,
  ServiceInfoResponse,
} from "../types/api";

// AI Categorization Logic (same as Jac backend)
function categorizeTask(
  description: string
): "Work" | "Personal" | "Health" | "Learning" | "General" {
  const desc = description.toLowerCase();

  if (
    desc.includes("meeting") ||
    desc.includes("report") ||
    desc.includes("project") ||
    desc.includes("work") ||
    desc.includes("email")
  ) {
    return "Work";
  } else if (
    desc.includes("buy") ||
    desc.includes("grocery") ||
    desc.includes("shopping") ||
    desc.includes("clean") ||
    desc.includes("home")
  ) {
    return "Personal";
  } else if (
    desc.includes("run") ||
    desc.includes("exercise") ||
    desc.includes("gym") ||
    desc.includes("walk") ||
    desc.includes("health")
  ) {
    return "Health";
  } else if (
    desc.includes("read") ||
    desc.includes("study") ||
    desc.includes("learn") ||
    desc.includes("course") ||
    desc.includes("book")
  ) {
    return "Learning";
  } else {
    return "General";
  }
}

// AI Insight Generation
function generateAiInsight(
  completedCount: number,
  pendingCount: number
): string {
  if (pendingCount === 0 && completedCount > 0) {
    return "🎉 Perfect! All tasks completed. Time to set new goals!";
  } else if (completedCount >= pendingCount && completedCount > 0) {
    return "📈 Excellent progress! You're completing tasks efficiently.";
  } else if (pendingCount > completedCount * 2) {
    return "⚡ Focus mode recommended! Consider tackling a few smaller tasks first.";
  } else {
    return "🎯 Good momentum! Keep working through your pending tasks.";
  }
}

// Local Storage Management
const STORAGE_KEY = "ai_task_manager_tasks";

function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Generate random task ID
function generateTaskId(): number {
  return Math.floor(Math.random() * 9000) + 1000;
}

// Simulate async operations for realistic feel
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const taskService = {
  // Create a new task
  async createTask(description: string): Promise<TaskResponse> {
    await delay(200); // Simulate network delay

    const tasks = loadTasks();
    const category = categorizeTask(description);
    const newTask: Task = {
      id: generateTaskId(),
      description,
      category,
      completed: false,
      priority: "Medium", // Default priority
    };

    tasks.push(newTask);
    saveTasks(tasks);

    console.log("✅ Task created:", newTask);

    return {
      success: true,
      task: newTask,
      message: "Task created successfully",
    };
  },

  // Get all tasks with AI insights
  async getTasks(): Promise<TaskListResponse> {
    await delay(150); // Simulate network delay

    const tasks = loadTasks();
    const pendingTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    const aiInsight = generateAiInsight(
      completedTasks.length,
      pendingTasks.length
    );

    console.log("📋 Tasks loaded:", {
      pending: pendingTasks.length,
      completed: completedTasks.length,
    });

    return {
      success: true,
      data: {
        pending_tasks: pendingTasks,
        completed_tasks: completedTasks,
        stats: {
          total_pending: pendingTasks.length,
          total_completed: completedTasks.length,
          completion_rate:
            tasks.length > 0 ? completedTasks.length / tasks.length : 0,
        },
        ai_insight: aiInsight,
      },
    };
  },

  // Complete a task
  async completeTask(taskId: number): Promise<TaskResponse> {
    await delay(100);

    const tasks = loadTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      return {
        success: false,
        error: "Task not found",
        task_id: taskId,
      };
    }

    task.completed = true;
    saveTasks(tasks);

    console.log("✅ Task completed:", task);

    return {
      success: true,
      task,
      message: "Task completed successfully",
    };
  },

  // Delete a task
  async deleteTask(taskId: number): Promise<TaskResponse> {
    await delay(100);

    const tasks = loadTasks();
    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return {
        success: false,
        error: "Task not found",
        task_id: taskId,
      };
    }

    const deletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    saveTasks(tasks);

    console.log("🗑️ Task deleted:", deletedTask);

    return {
      success: true,
      message: "Task deleted successfully",
      task_id: taskId,
    };
  },

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    await delay(50);

    return {
      status: "healthy",
      service: "AI Task Manager (Local)",
      version: "1.0.0",
      features: [
        "ai_categorization",
        "productivity_insights",
        "task_management",
        "local_storage",
      ],
    };
  },

  // Service info
  async getServiceInfo(): Promise<ServiceInfoResponse> {
    await delay(50);

    return {
      name: "AI-Powered Task Manager (Local)",
      description:
        "Intelligent task management with AI categorization and insights - Running locally!",
      endpoints: {
        createTask: "Create new tasks with AI categorization",
        getTasks: "Get all tasks with productivity insights",
        completeTask: "Mark tasks as completed",
        deleteTask: "Remove tasks from list",
      },
      ai_features: {
        categorization:
          "Automatic task categorization (Work, Personal, Health, Learning, General)",
        insights:
          "Real-time productivity insights based on completion patterns",
        local_storage:
          "Persistent data storage in browser - no server required!",
      },
    };
  },
};

export default taskService;
