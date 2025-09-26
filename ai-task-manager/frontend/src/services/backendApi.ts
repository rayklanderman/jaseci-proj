// Backend API Service - Connects to FastAPI Jac backend
import type {
  Task,
  TaskResponse,
  TaskListResponse,
  HealthCheckResponse,
  ServiceInfoResponse,
} from "../types/api";

const API_BASE_URL = "http://localhost:8000";

// API utility function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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
function convertBackendTask(backendTask: any): Task {
  return {
    id:
      parseInt(backendTask.id.split("_")[1]) ||
      Math.floor(Math.random() * 9000) + 1000,
    description: backendTask.content,
    category: backendTask.category,
    completed: backendTask.status === "completed",
    priority: backendTask.priority,
  };
}

export const backendTaskService = {
  // Create a new task
  async createTask(description: string): Promise<TaskResponse> {
    try {
      const response = await apiCall<any>("/tasks", {
        method: "POST",
        body: JSON.stringify({ content: description }),
      });

      const task = convertBackendTask(response.task);

      console.log("✅ Task created via backend:", task);

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
      const response = await apiCall<any>("/tasks");

      const tasks = response.tasks.map(convertBackendTask);
      const pendingTasks = tasks.filter((t) => !t.completed);
      const completedTasks = tasks.filter((t) => t.completed);

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

      console.log("📋 Tasks loaded from backend:", {
        total: tasks.length,
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
  async completeTask(taskId: number): Promise<TaskResponse> {
    try {
      // Find the task ID format the backend expects
      const tasksResponse = await this.getTasks();
      if (!tasksResponse.success) {
        throw new Error("Could not fetch tasks to find backend ID");
      }

      const allTasks = [
        ...tasksResponse.data.pending_tasks,
        ...tasksResponse.data.completed_tasks,
      ];
      const task = allTasks.find((t) => t.id === taskId);

      if (!task) {
        return {
          success: false,
          error: "Task not found",
          task_id: taskId,
        };
      }

      // Use the backend format - we need to convert back to backend task ID
      const backendTaskId = `task_${taskId}`;

      const response = await apiCall<any>(`/tasks/${backendTaskId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "completed" }),
      });

      const updatedTask = convertBackendTask(response.task);

      console.log("✅ Task completed via backend:", updatedTask);

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
  async deleteTask(taskId: number): Promise<TaskResponse> {
    try {
      const backendTaskId = `task_${taskId}`;

      const response = await apiCall<any>(`/tasks/${backendTaskId}`, {
        method: "DELETE",
      });

      console.log("🗑️ Task deleted via backend:", taskId);

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
      const response = await apiCall<any>("/HealthCheck");

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
