// Local Task Management Service - No backend required!
// Provides a fully working task manager when the Jac backend is unavailable

import type {
  Task,
  TaskId,
  TaskResponse,
  TaskListResponse,
  HealthCheckResponse,
  ServiceInfoResponse,
} from "../types/api";

// --- Helpers -----------------------------------------------------------------

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
  }
  if (
    desc.includes("buy") ||
    desc.includes("grocery") ||
    desc.includes("shopping") ||
    desc.includes("clean") ||
    desc.includes("home")
  ) {
    return "Personal";
  }
  if (
    desc.includes("run") ||
    desc.includes("exercise") ||
    desc.includes("gym") ||
    desc.includes("walk") ||
    desc.includes("health")
  ) {
    return "Health";
  }
  if (
    desc.includes("read") ||
    desc.includes("study") ||
    desc.includes("learn") ||
    desc.includes("course") ||
    desc.includes("book")
  ) {
    return "Learning";
  }

  return "General";
}

function generateAiInsight(
  completedCount: number,
  pendingCount: number
): string {
  if (pendingCount === 0 && completedCount > 0) {
    return "🎉 Perfect! All tasks completed. Time to set new goals!";
  }
  if (completedCount >= pendingCount && completedCount > 0) {
    return "📈 Excellent progress! You're completing tasks efficiently.";
  }
  if (pendingCount > completedCount * 2) {
    return "⚡ Focus mode recommended! Consider tackling a few smaller tasks first.";
  }
  return "🎯 Good momentum! Keep working through your pending tasks.";
}

const STORAGE_KEY = "ai_task_manager_tasks";

function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((task) => ({
      ...task,
      id: String(task.id) as TaskId,
    }));
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  const payload = tasks.map((task) => ({
    ...task,
    id: String(task.id),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function generateTaskId(): TaskId {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Public service -----------------------------------------------------------

export const taskService = {
  async createTask(description: string): Promise<TaskResponse> {
    await delay(200);

    const tasks = loadTasks();
    const timestamp = new Date().toISOString();
    const newTask: Task = {
      id: generateTaskId(),
      description,
      category: categorizeTask(description),
      completed: false,
      priority: "Medium",
      created_at: timestamp,
    };

    tasks.push(newTask);
    saveTasks(tasks);

    return {
      success: true,
      task: newTask,
      message: "Task created successfully",
    };
  },

  async getTasks(): Promise<TaskListResponse> {
    await delay(150);

    const tasks = loadTasks();
    const pendingTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);

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
        ai_insight: generateAiInsight(
          completedTasks.length,
          pendingTasks.length
        ),
      },
    };
  },

  async completeTask(taskId: TaskId): Promise<TaskResponse> {
    await delay(100);

    const tasks = loadTasks();
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return {
        success: false,
        error: "Task not found",
        task_id: taskId,
      };
    }

    task.completed = true;
    saveTasks(tasks);

    return {
      success: true,
      task,
      message: "Task completed successfully",
    };
  },

  async deleteTask(taskId: TaskId): Promise<TaskResponse> {
    await delay(100);

    const tasks = loadTasks();
    const filtered = tasks.filter((task) => task.id !== taskId);

    if (filtered.length === tasks.length) {
      return {
        success: false,
        error: "Task not found",
        task_id: taskId,
      };
    }

    saveTasks(filtered);

    return {
      success: true,
      message: "Task deleted successfully",
      task_id: taskId,
    };
  },

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
