// Backend API Service - Connects to FastAPI Jac backend
import type {
  Task,
  TaskResponse,
  TaskListResponse,
  HealthCheckResponse,
  ServiceInfoResponse,
  TaskId,
} from "../types/api";

const isDev = import.meta.env.DEV;

interface BackendTaskPayload {
  id: string;
  content: string;
  category: Task["category"];
  priority: Task["priority"];
  status: "pending" | "in-progress" | "completed";
  due_date?: string;
  created_at?: string;
}

interface BackendTaskEnvelope {
  success: boolean;
  message?: string;
  task: BackendTaskPayload;
}

interface BackendTasksEnvelope {
  success: boolean;
  tasks: BackendTaskPayload[];
}

// Dynamic API base URL detection
function getApiBaseUrl(): string {
  // In production (Vercel), use /api prefix for serverless functions
  if (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return window.location.origin + "/api";
  }
  // In development, use localhost:8000
  return "http://localhost:8000";
}

// API utility function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const API_BASE_URL = getApiBaseUrl();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Convert backend task format to frontend format
function convertBackendTask(backendTask: BackendTaskPayload): Task {
  return {
    id: String(backendTask.id) as TaskId,
    description: backendTask.content,
    category: backendTask.category,
    completed: backendTask.status === "completed",
    priority: backendTask.priority,
    due_date: backendTask.due_date,
    created_at: backendTask.created_at,
  };
}

export const backendTaskService = {
  // Create a new task
  async createTask(description: string): Promise<TaskResponse> {
    try {
      const response = await apiCall<BackendTaskEnvelope>("/tasks", {
        method: "POST",
        body: JSON.stringify({ content: description }),
      });

      const task = convertBackendTask(response.task);

      if (isDev) console.log("✅ Task created via backend:", task);

      return {
        success: true,
        task,
        message: response.message || "Task created successfully",
      };
    } catch (error) {
      console.error("❌ Failed to create task:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // Get all tasks
  async getTasks(): Promise<TaskListResponse> {
    try {
      const response = await apiCall<BackendTasksEnvelope>("/tasks");

      const tasks = response.tasks.map(convertBackendTask);
      const pendingTasks = tasks.filter((t: Task) => !t.completed);
      const completedTasks = tasks.filter((t: Task) => t.completed);

      // Generate AI insight based on completion rate
      let aiInsight = "📊 Task analysis in progress...";
      if (completedTasks.length === 0 && pendingTasks.length > 0) {
        aiInsight =
          "🚀 Ready to start! Focus on completing your pending tasks.";
      } else if (completedTasks.length > 0 && pendingTasks.length === 0) {
        aiInsight = "🎉 Amazing! All tasks completed. Time for new challenges!";
      } else if (completedTasks.length >= pendingTasks.length) {
        aiInsight = "📈 Great progress! You're staying on top of your tasks.";
      } else if (pendingTasks.length > completedTasks.length * 2) {
        aiInsight =
          "⚡ Focus time! Consider tackling smaller tasks first for momentum.";
      } else {
        aiInsight = "🎯 Good pace! Keep working through your task list.";
      }

      if (isDev) {
        console.log("📋 Tasks loaded from backend:", {
          total: tasks.length,
          pending: pendingTasks.length,
          completed: completedTasks.length,
        });
      }

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
    } catch (error) {
      console.error("❌ Failed to fetch tasks:", error);
      return {
        success: false,
        data: {
          pending_tasks: [],
          completed_tasks: [],
          stats: {
            total_pending: 0,
            total_completed: 0,
            completion_rate: 0,
          },
          ai_insight: "⚠️ Unable to load tasks. Please try again.",
        },
      };
    }
  },

  // Complete a task
  async completeTask(taskId: TaskId): Promise<TaskResponse> {
    try {
      const response = await apiCall<BackendTaskEnvelope>(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "completed" }),
      });

      const updatedTask = convertBackendTask(response.task);

      if (isDev) console.log("✅ Task completed via backend:", updatedTask);

      return {
        success: true,
        task: updatedTask,
        message: response.message || "Task completed successfully",
      };
    } catch (error) {
      console.error("❌ Failed to complete task:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        task_id: taskId,
      };
    }
  },

  // Delete a task
  async deleteTask(taskId: TaskId): Promise<TaskResponse> {
    try {
      const response = await apiCall<{ success: boolean; message?: string }>(
        `/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (isDev) console.log("🗑️ Task deleted via backend:", taskId);

      return {
        success: true,
        message: response.message || "Task deleted successfully",
        task_id: taskId,
      };
    } catch (error) {
      console.error("❌ Failed to delete task:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        task_id: taskId,
      };
    }
  },

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await apiCall<{
        status: string;
        service: string;
        ai_available?: boolean;
        tasks_count?: number;
        timestamp?: string;
      }>("/HealthCheck");

      return {
        status: response.status,
        service: response.service,
        version: "1.0.0",
        features: [
          "jac_integration",
          "ai_categorization",
          "task_management",
          "backend_api",
        ],
        backend_info: {
          ai_available: response.ai_available,
          tasks_count: response.tasks_count,
          timestamp: response.timestamp,
        },
      };
    } catch (error) {
      console.error("❌ Health check failed:", error);
      return {
        status: "unhealthy",
        service: "AI Task Manager Backend",
        version: "1.0.0",
        features: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // Service info
  async getServiceInfo(): Promise<ServiceInfoResponse> {
    try {
      const healthResponse = await this.healthCheck();

      return {
        name: "AI-Powered Task Manager (Backend)",
        description:
          "Intelligent task management with Jac language integration and AI categorization",
        endpoints: {
          createTask: "POST /tasks - Create new tasks with AI categorization",
          getTasks: "GET /tasks - Get all tasks with analytics",
          updateTask: "PUT /tasks/{id} - Update task status",
          deleteTask: "DELETE /tasks/{id} - Remove tasks",
        },
        ai_features: {
          categorization: "AI-powered task categorization using Jac language",
          priority: "Intelligent priority assignment",
          analytics: "Task completion analytics and insights",
          backend_integration: "Full backend API with persistent storage",
        },
        status: healthResponse.status,
      };
    } catch (error) {
      return {
        name: "AI-Powered Task Manager (Backend)",
        description: "Backend service unavailable",
        endpoints: {},
        ai_features: {},
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

export default backendTaskService;
