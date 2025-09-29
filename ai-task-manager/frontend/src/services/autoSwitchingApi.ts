// Auto-Switching Task API Service
// Automatically switches between Jac backend and local simulation

import type {
  TaskResponse,
  TaskListResponse,
  HealthCheckResponse,
  ServiceInfoResponse,
  TaskId,
  AIBriefResponse,
} from "../types/api";

import backendDetector, { type BackendStatus } from "./backendDetector";
import backendTaskService from "./backendApi";
import { taskService as localTaskService } from "./api";

const isDev = import.meta.env.DEV;

class AutoSwitchingTaskService {
  private static pollerHandle: number | null = null;
  private readonly pollIntervalMs = 1000;

  constructor() {
    // Auto-update backend detection in the background
    if (
      typeof window !== "undefined" &&
      AutoSwitchingTaskService.pollerHandle === null
    ) {
      AutoSwitchingTaskService.pollerHandle = window.setInterval(() => {
        backendDetector.getStatus();
      }, this.pollIntervalMs);
    }
    backendDetector.getStatus();
  }

  /**
   * Create task (auto-switching)
   */
  async createTask(description: string): Promise<TaskResponse> {
    if (backendDetector.useJacBackend()) {
      try {
        if (isDev) console.log("🚀 Using Jac backend for task creation");
        return await backendTaskService.createTask(description);
      } catch (error) {
        console.warn(
          "⚠️ Jac backend failed, falling back to local mode:",
          error
        );
        // Fall through to local mode
      }
    }

    // Local mode fallback
    if (isDev) console.log("📱 Using local mode for task creation");
    return await localTaskService.createTask(description);
  }

  /**
   * Get tasks (auto-switching)
   */
  async getTasks(): Promise<TaskListResponse> {
    const backendStatus = backendDetector.getStatus();
    if (isDev) {
      console.log("🔍 Debug - Backend status for getTasks:", backendStatus);
      console.log(
        "🔍 Debug - useJacBackend():",
        backendDetector.useJacBackend()
      );
    }

    if (backendDetector.useJacBackend()) {
      try {
        if (isDev) console.log("🚀 Using Jac backend for task list");
        return await backendTaskService.getTasks();
      } catch (error) {
        console.warn(
          "⚠️ Jac backend failed, falling back to local mode:",
          error
        );
        // Fall through to local mode
      }
    }

    // Local mode fallback
    if (isDev) console.log("📱 Using local mode for task list");
    return await localTaskService.getTasks();
  }

  /**
   * Complete task (auto-switching)
   */
  async completeTask(taskId: TaskId): Promise<TaskResponse> {
    if (backendDetector.useJacBackend()) {
      try {
        if (isDev) console.log("🚀 Using Jac backend for task completion");
        return await backendTaskService.completeTask(taskId);
      } catch (error) {
        console.warn(
          "⚠️ Jac backend failed, falling back to local mode:",
          error
        );
        // Fall through to local mode
      }
    }

    // Local mode fallback
    if (isDev) console.log("📱 Using local mode for task completion");
    return await localTaskService.completeTask(taskId);
  }

  /**
   * Delete task (auto-switching)
   */
  async deleteTask(taskId: TaskId): Promise<TaskResponse> {
    if (backendDetector.useJacBackend()) {
      try {
        if (isDev) console.log("🚀 Using Jac backend for task deletion");
        return await backendTaskService.deleteTask(taskId);
      } catch (error) {
        console.warn(
          "⚠️ Jac backend failed, falling back to local mode:",
          error
        );
        // Fall through to local mode
      }
    }

    // Local mode fallback
    if (isDev) console.log("📱 Using local mode for task deletion");
    return await localTaskService.deleteTask(taskId);
  }

  /**
   * Update task attributes (currently supports completion toggles)
   */
  async updateTask(
    taskId: TaskId,
    updates: { completed?: boolean }
  ): Promise<TaskResponse> {
    if (typeof updates.completed === "boolean" && updates.completed) {
      return this.completeTask(taskId);
    }

    return {
      success: false,
      error: "Only completion updates are supported in the current client",
      task_id: taskId,
    };
  }

  /**
   * Health check (auto-switching)
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    if (backendDetector.useJacBackend()) {
      try {
        console.log("🚀 Using Jac backend for health check");
        return await backendTaskService.healthCheck();
      } catch (error) {
        console.warn("⚠️ Jac backend health check failed:", error);
        // Fall through to local mode
      }
    }

    // Local mode fallback
    return await localTaskService.healthCheck();
  }

  /**
   * Get service info (auto-switching)
   */
  async getServiceInfo(): Promise<ServiceInfoResponse> {
    if (backendDetector.useJacBackend()) {
      try {
        console.log("🚀 Using Jac backend for service info");
        return await backendTaskService.getServiceInfo();
      } catch (error) {
        console.warn("⚠️ Jac backend service info failed:", error);
        // Fall through to local mode
      }
    }

    // Local mode fallback
    return await localTaskService.getServiceInfo();
  }

  /**
   * Get current backend status
   */
  getBackendStatus(): BackendStatus {
    return backendDetector.getStatus();
  }

  /**
   * Force backend detection refresh
   */
  async refreshBackendStatus(): Promise<BackendStatus> {
    return await backendDetector.forceCheck();
  }

  async getAIBrief(): Promise<AIBriefResponse> {
    if (backendDetector.useJacBackend()) {
      try {
        if (isDev) console.log("🚀 Using Jac backend for AI brief");
        return await backendTaskService.getAIBrief();
      } catch (error) {
        console.warn(
          "⚠️ Jac backend AI brief failed, falling back to local mode:",
          error
        );
      }
    }

    if (isDev) console.log("📱 Using local mode brief");
    return await localTaskService.getAIBrief();
  }
}

// Export singleton instance
export const autoSwitchingTaskService = new AutoSwitchingTaskService();
export default autoSwitchingTaskService;
