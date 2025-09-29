// TypeScript interfaces for the AI Task Manager

export type TaskId = string;

export interface Task {
  id: TaskId;
  description: string;
  category: "Work" | "Personal" | "Health" | "Learning" | "General";
  completed: boolean;
  priority?: "High" | "Medium" | "Low";
  title?: string;
  due_date?: string;
  created_at?: string;
}

export interface TaskStats {
  total_pending: number;
  total_completed: number;
  completion_rate: number;
}

export interface TaskListResponse {
  success: boolean;
  data: {
    pending_tasks: Task[];
    completed_tasks: Task[];
    stats: TaskStats;
    ai_insight: string;
  };
}

export interface TaskResponse {
  success: boolean;
  task?: Task;
  message?: string;
  error?: string;
  task_id?: TaskId;
}

export interface CreateTaskRequest {
  action: "create";
  description: string;
}

export interface CompleteTaskRequest {
  action: "complete";
  task_id: TaskId;
}

export interface ListTasksRequest {
  action: "list";
}

export interface DeleteTaskRequest {
  action: "delete";
  task_id: TaskId;
}

export type TaskRequest =
  | CreateTaskRequest
  | CompleteTaskRequest
  | ListTasksRequest
  | DeleteTaskRequest;

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  features: string[];
  backend_info?: {
    ai_available: boolean;
    tasks_count: number;
    timestamp: string;
  };
  error?: string;
}

export interface ServiceInfoResponse {
  name: string;
  description: string;
  endpoints: Record<string, string>;
  ai_features: Record<string, string>;
  status?: string;
  error?: string;
}
