// Smart Notifications Service
// Integrates with the existing service worker for task reminders

import type { TaskId } from "../types/api";

export interface TaskReminderOptions {
  taskId: TaskId;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  reminderTime?: Date;
}

export class SmartNotificationService {
  private static instance: SmartNotificationService;
  private registrationPromise: Promise<ServiceWorkerRegistration | null>;

  private constructor() {
    this.registrationPromise = this.getServiceWorkerRegistration();
  }

  static getInstance(): SmartNotificationService {
    if (!SmartNotificationService.instance) {
      SmartNotificationService.instance = new SmartNotificationService();
    }
    return SmartNotificationService.instance;
  }

  private async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if ("serviceWorker" in navigator) {
      try {
        return await navigator.serviceWorker.ready;
      } catch (error) {
        console.warn("Service Worker not available:", error);
        return null;
      }
    }
    return null;
  }

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  async scheduleTaskReminder(options: TaskReminderOptions): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn("Notification permission denied");
      return;
    }

    // Calculate optimal reminder time based on priority
    const reminderDelay = this.calculateReminderDelay(
      options.priority,
      options.reminderTime
    );

    if (reminderDelay <= 0) {
      // Show immediate notification
      this.showImmediateNotification(options);
      return;
    }

    // Schedule future notification
    setTimeout(() => {
      this.showImmediateNotification(options);
    }, reminderDelay);

    console.log(
      `📅 Task reminder scheduled for ${new Date(
        Date.now() + reminderDelay
      ).toLocaleString()}`
    );
  }

  private calculateReminderDelay(priority: string, customTime?: Date): number {
    if (customTime) {
      return customTime.getTime() - Date.now();
    }

    // Smart timing based on priority
    switch (priority) {
      case "High":
        return 5 * 60 * 1000; // 5 minutes
      case "Medium":
        return 30 * 60 * 1000; // 30 minutes
      case "Low":
        return 2 * 60 * 60 * 1000; // 2 hours
      default:
        return 60 * 60 * 1000; // 1 hour
    }
  }

  private async showImmediateNotification(
    options: TaskReminderOptions
  ): Promise<void> {
    const registration = await this.registrationPromise;

    if (registration) {
      // Use service worker for rich notifications
      registration.showNotification("🤖 AI Task Reminder", {
        body: options.description,
        icon: "/icon-192.png",
        badge: "/badge.png",
        tag: `task-${options.taskId}`,
        requireInteraction: options.priority === "High",
        actions: [
          {
            action: "complete",
            title: "✅ Mark Complete",
          },
          {
            action: "snooze",
            title: "⏰ Remind in 1h",
          },
        ],
        data: {
          taskId: options.taskId,
          priority: options.priority.toLowerCase(),
          body: options.description,
        },
      });
    } else {
      // Fallback to basic notification
      new Notification(`🤖 Task Reminder: ${options.title}`, {
        body: options.description,
        icon: "/icon-192.png",
        tag: `task-${options.taskId}`,
      });
    }
  }

  async scheduleMultipleReminders(tasks: TaskReminderOptions[]): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    for (const task of tasks) {
      await this.scheduleTaskReminder(task);
    }

    console.log(`📱 Scheduled ${tasks.length} task reminders`);
  }

  // Cancel notifications for completed tasks
  async cancelTaskNotification(taskId: TaskId): Promise<void> {
    const registration = await this.registrationPromise;
    if (registration) {
      const notifications = await registration.getNotifications({
        tag: `task-${taskId}`,
      });

      notifications.forEach((notification) => notification.close());
    }
  }
}

// Export singleton instance
export const notificationService = SmartNotificationService.getInstance();

// Easy integration functions for TaskManager
export const useSmartNotifications = () => {
  const scheduleReminder = async (task: {
    id: TaskId;
    description: string;
    priority?: string;
    dueDate?: string;
  }) => {
    await notificationService.scheduleTaskReminder({
      taskId: task.id,
      title: task.description,
      description: task.description,
      priority:
        task.priority === "High" ||
        task.priority === "Medium" ||
        task.priority === "Low"
          ? task.priority
          : "Medium",
      reminderTime: task.dueDate ? new Date(task.dueDate) : undefined,
    });
  };

  const cancelReminder = async (taskId: TaskId) => {
    await notificationService.cancelTaskNotification(taskId);
  };

  return { scheduleReminder, cancelReminder };
};
