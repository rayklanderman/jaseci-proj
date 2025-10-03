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
  private readonly explicitBackendConfigured = Boolean(
    import.meta.env.VITE_BACKEND_BASE_URL?.trim()
  );
  private lastBackendSuccess = false;
  private lastBackendFailureAt: number | null = null;

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

  private isBackendCooldownOver(): boolean {
    if (this.lastBackendFailureAt === null) {
      return true;
    }
    const COOLDOWN_MS = 10_000;
    return Date.now() - this.lastBackendFailureAt > COOLDOWN_MS;
  }

  private shouldAttemptBackend(): boolean {
    const status = backendDetector.getStatus();
    const backendAvailable =
      status.isAvailable && status.mode === "jac-backend";

    if (backendAvailable) {
      return true;
    }

    if (this.lastBackendSuccess && this.isBackendCooldownOver()) {
      return true;
    }

    if (this.explicitBackendConfigured && this.isBackendCooldownOver()) {
      return true;
    }

    return false;
  }

  private recordBackendSuccess(): void {
    this.lastBackendSuccess = true;
    this.lastBackendFailureAt = null;
  }

  private recordBackendFailure(): void {
    this.lastBackendSuccess = false;
    this.lastBackendFailureAt = Date.now();
  }

  private shouldFallbackToLocal(error?: string): boolean {
    if (!error) {
      return false;
    }

    const message = error.toLowerCase();

    if (message.includes("404") || message.includes("400")) {
      return false;
    }

    return (
      message.includes("failed to fetch") ||
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("cors") ||
      message.includes("503") ||
      message.includes("typeerror") ||
      message.includes("api error: 5")
    );
  }

  /**
   * Create task (auto-switching)
   */
  async createTask(description: string): Promise<TaskResponse> {
    if (this.shouldAttemptBackend()) {
      const response = await backendTaskService.createTask(description);

      if (response.success) {
        if (isDev) console.log("🚀 Using Jac backend for task creation");
        this.recordBackendSuccess();
        return response;
      }

      this.recordBackendFailure();
      if (!this.shouldFallbackToLocal(response.error)) {
        return response;
      }

      console.warn(
        "⚠️ Jac backend createTask failed, attempting local fallback:",
        response.error
      );
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
      console.log("🔍 Debug - last backend success:", this.lastBackendSuccess);
    }

    if (this.shouldAttemptBackend()) {
      const response = await backendTaskService.getTasks();

      if (response.success) {
        if (isDev) console.log("🚀 Using Jac backend for task list");
        this.recordBackendSuccess();
        return response;
      }

      this.recordBackendFailure();
      console.warn(
        "⚠️ Jac backend getTasks failed, falling back to local mode"
      );
    }

    // Local mode fallback
    if (isDev) console.log("📱 Using local mode for task list");
    return await localTaskService.getTasks();
  }

  /**
   * Complete task (auto-switching)
   */
  async completeTask(taskId: TaskId): Promise<TaskResponse> {
    if (this.shouldAttemptBackend()) {
      const response = await backendTaskService.completeTask(taskId);

      if (response.success) {
        if (isDev) console.log("🚀 Using Jac backend for task completion");
        this.recordBackendSuccess();
        return response;
      }

      this.recordBackendFailure();
      if (!this.shouldFallbackToLocal(response.error)) {
        return response;
      }

      console.warn(
        "⚠️ Jac backend completeTask failed, attempting local fallback:",
        response.error
      );
    }

    // Local mode fallback
    if (isDev) console.log("📱 Using local mode for task completion");
    return await localTaskService.completeTask(taskId);
  }

  /**
   * Delete task (auto-switching)
   */
  async deleteTask(taskId: TaskId): Promise<TaskResponse> {
    if (this.shouldAttemptBackend()) {
      const response = await backendTaskService.deleteTask(taskId);

      if (response.success) {
        if (isDev) console.log("🚀 Using Jac backend for task deletion");
        this.recordBackendSuccess();
        return response;
      }

      this.recordBackendFailure();
      if (!this.shouldFallbackToLocal(response.error)) {
        return response;
      }

      console.warn(
        "⚠️ Jac backend deleteTask failed, attempting local fallback:",
        response.error
      );
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
