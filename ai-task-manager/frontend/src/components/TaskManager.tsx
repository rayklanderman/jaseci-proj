import React, { useState, useEffect, useCallback } from "react";
import autoSwitchingTaskService from "../services/autoSwitchingApi";
import type { BackendStatus } from "../services/backendDetector";
import type { Task, TaskId, TaskListResponse, AIBriefData } from "../types/api";
import { useTheme } from "../services/themeService";
import { useSmartNotifications } from "../services/smartNotifications";
import { SmartDateParser } from "../services/smartDateParser";
import type { ParsedDate } from "../services/smartDateParser";
import type { TaskTemplate } from "../services/taskTemplates";
import { CustomTemplateService } from "../services/taskTemplates";

const STORAGE_KEY = "ai_task_manager_tasks";

const KEYWORD_TEMPLATE_RULES: Array<{
  pattern: RegExp;
  templateIds: string[];
}> = [
  {
    pattern: /(meeting|sync|stand[- ]?up|client|call)/i,
    templateIds: ["meeting-prep", "project-kickoff"],
  },
  {
    pattern: /(project|launch|kickoff|plan)/i,
    templateIds: ["project-kickoff", "weekly-review"],
  },
  { pattern: /(review|weekly|summary)/i, templateIds: ["weekly-review"] },
  { pattern: /(grocery|shopping|store)/i, templateIds: ["grocery-run"] },
  {
    pattern: /(home|maintenance|chores|clean)/i,
    templateIds: ["home-maintenance", "digital-declutter"],
  },
  {
    pattern: /(workout|gym|exercise|training)/i,
    templateIds: ["workout-plan"],
  },
  { pattern: /(meal prep|meal-prep|cook|recipe)/i, templateIds: ["meal-prep"] },
  {
    pattern: /(study|learn|course|class|training)/i,
    templateIds: ["study-session", "skill-practice"],
  },
  { pattern: /(practice|skill|improve)/i, templateIds: ["skill-practice"] },
  {
    pattern: /(digital|files|cleanup|organize)/i,
    templateIds: ["digital-declutter"],
  },
];

type FeedbackKind = "success" | "error" | "info";

interface ActionFeedback {
  type: FeedbackKind;
  message: string;
}

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: TaskId) => void;
  onDelete: (taskId: TaskId) => void;
  canComplete: boolean;
  isBusy: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  onDelete,
  canComplete,
  isBusy,
}) => {
  const priorityTone: Record<string, string> = {
    High: "text-red-600 bg-red-50 border-red-200",
    Medium: "text-amber-600 bg-amber-50 border-amber-200",
    Low: "text-emerald-600 bg-emerald-50 border-emerald-200",
  };

  const badgeClass =
    priorityTone[task.priority ?? ""] ??
    "text-slate-600 bg-slate-50 border-slate-200";

  const truncatedId = task.id.length > 8 ? `${task.id.slice(0, 8)}…` : task.id;

  return (
    <article className="surface-card rounded-xl border border-slate-200 p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => onComplete(task.id)}
          disabled={!canComplete || task.completed || isBusy}
          className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
            task.completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          }`}
          title={
            task.completed
              ? "Task already completed"
              : canComplete
              ? "Mark task as complete"
              : "Completion disabled for this list"
          }
        >
          {task.completed ? "✓" : ""}
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              {task.category ?? "General"}
            </span>
            {task.priority && (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${badgeClass}`}
              >
                <span>Priority</span>
                <span>{task.priority}</span>
              </span>
            )}
            <span className="text-xs text-slate-400">#{truncatedId}</span>
          </div>

          <p
            className={`text-base font-medium leading-relaxed text-slate-800 ${
              task.completed ? "line-through text-slate-400" : ""
            }`}
          >
            {task.description}
          </p>

          {task.aiReasoning && (
            <p className="surface-muted rounded-lg px-3 py-2 text-xs text-slate-500">
              {task.aiReasoning}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {task.created_at && (
              <span>
                Added{" "}
                {new Date(task.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {task.due_date && (
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 font-medium text-indigo-600">
                Due{" "}
                {new Date(task.due_date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {typeof task.aiConfidence === "number" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-600">
                🤖 {Math.round(task.aiConfidence * 100)}% confidence
              </span>
            )}
            {task.aiTags?.length ? (
              <span className="flex flex-wrap items-center gap-1">
                {task.aiTags.slice(0, 2).map((tag) => (
                  <span
                    key={`${task.id}-${tag}`}
                    className="rounded-full bg-slate-100 px-2 py-1 text-[0.7rem] font-medium text-slate-500"
                  >
                    #{tag}
                  </span>
                ))}
                {task.aiTags.length > 2 && (
                  <span className="text-[0.7rem] text-slate-400">
                    +{task.aiTags.length - 2}
                  </span>
                )}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {canComplete && !task.completed && (
            <button
              type="button"
              onClick={() => onComplete(task.id)}
              disabled={isBusy}
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-progress disabled:opacity-60"
            >
              Mark complete
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            disabled={isBusy}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-progress disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
};

interface TaskListProps {
  tasks: Task[];
  title: string;
  caption: string;
  emptyMessage: string;
  icon: string;
  onComplete: (taskId: TaskId) => void;
  onDelete: (taskId: TaskId) => void;
  isBusy: boolean;
  allowComplete?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  title,
  caption,
  emptyMessage,
  icon,
  onComplete,
  onDelete,
  isBusy,
  allowComplete = true,
}) => {
  return (
    <section className="surface-card space-y-4 rounded-2xl border border-slate-200 p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span className="text-lg">{icon}</span>
            <span>{caption}</span>
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{title}</h2>
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </span>
      </header>

      {tasks.length === 0 ? (
        <div className="surface-muted rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
              canComplete={allowComplete}
              isBusy={isBusy}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<TaskListResponse | null>(null);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(
    null
  );
  const [aiBrief, setAIBrief] = useState<AIBriefData | null>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(
    null
  );
  const [showCompleted, setShowCompleted] = useState(true);
  const [templateSuggestions, setTemplateSuggestions] = useState<
    TaskTemplate[]
  >([]);
  const [dateSuggestion, setDateSuggestion] = useState<ParsedDate | null>(null);

  const { theme, toggleTheme } = useTheme();
  const { scheduleReminder, cancelReminder, requestPermission } =
    useSmartNotifications();

  const featuredTemplates = CustomTemplateService.getAllTemplates().slice(0, 6);

  useEffect(() => {
    void requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    const text = newTaskDescription.trim();
    if (text.length < 3) {
      setTemplateSuggestions([]);
      return;
    }

    const allTemplates = CustomTemplateService.getAllTemplates();
    const suggestions = new Map<string, TaskTemplate>();

    KEYWORD_TEMPLATE_RULES.forEach((rule) => {
      if (!rule.pattern.test(text)) return;
      rule.templateIds.forEach((templateId) => {
        const match = allTemplates.find(
          (template) => template.id === templateId
        );
        if (match) {
          suggestions.set(match.id, match);
        }
      });
    });

    if (suggestions.size < 4) {
      const lowerText = text.toLowerCase();
      for (const template of allTemplates) {
        if (suggestions.size >= 4) break;
        const matchesQuery =
          template.name.toLowerCase().includes(lowerText) ||
          template.description.toLowerCase().includes(lowerText) ||
          template.subtasks?.some((subtask) =>
            subtask.toLowerCase().includes(lowerText)
          );
        if (matchesQuery) {
          suggestions.set(template.id, template);
        }
      }
    }

    setTemplateSuggestions(Array.from(suggestions.values()).slice(0, 4));
  }, [newTaskDescription]);

  useEffect(() => {
    if (!newTaskDescription.trim() || selectedDate) {
      setDateSuggestion(null);
      return;
    }

    const parsed = SmartDateParser.parseFromText(newTaskDescription);
    setDateSuggestion(parsed);
  }, [newTaskDescription, selectedDate]);

  const applyDateSuggestion = useCallback(() => {
    if (!dateSuggestion) return;

    const suggestionDate = dateSuggestion.date;
    const isoDate = suggestionDate.toISOString();
    setSelectedDate(isoDate.slice(0, 10));

    const hours = suggestionDate.getHours();
    const minutes = suggestionDate.getMinutes();
    if (hours !== 0 || minutes !== 0) {
      const timeString = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;
      setSelectedTime(timeString);
    } else {
      setSelectedTime("");
    }

    setDateSuggestion(null);
  }, [dateSuggestion]);

  const fetchAIBrief = useCallback(async () => {
    setIsBriefLoading(true);
    try {
      const response = await autoSwitchingTaskService.getAIBrief();
      if (response.success) {
        setAIBrief(response.data);
        setBriefError(null);
      } else {
        setAIBrief(response.data);
        setBriefError(
          response.error || "AI brief is currently using fallback insights."
        );
      }
    } catch (err) {
      console.error("Error generating AI daily brief:", err);
      setBriefError("Unable to generate a brief right now.");
    } finally {
      setIsBriefLoading(false);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await autoSwitchingTaskService.getTasks();
      if (response.success) {
        setTasks(response);
        setError(null);
        void fetchAIBrief();
      } else {
        setTasks(response);
        setError("We couldn't load tasks from the server.");
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError("Unable to connect to the AI Task Manager service.");
    } finally {
      setIsFetching(false);
    }
  }, [fetchAIBrief]);

  const removeOfflineTask = useCallback((taskId: TaskId) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (task: { id: string }) => String(task.id) !== String(taskId)
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
      }
    } catch {
      // Ignore storage failures
    }

    setTasks((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          pending_tasks: prev.data.pending_tasks.filter(
            (task) => task.id !== taskId
          ),
          completed_tasks: prev.data.completed_tasks.filter(
            (task) => task.id !== taskId
          ),
        },
      };
    });
  }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDescription.trim()) {
      setActionFeedback({
        type: "info",
        message: "Add a short description before saving.",
      });
      return;
    }

    setIsWorking(true);
    try {
      const parsedDate = SmartDateParser.parseFromText(newTaskDescription);
      let taskDescription = newTaskDescription.trim();
      let finalDueDate: Date | null = null;

      if (selectedDate) {
        const dateTimeString = selectedTime
          ? `${selectedDate}T${selectedTime}`
          : `${selectedDate}T09:00`;
        finalDueDate = new Date(dateTimeString);
        const timeLabel = selectedTime
          ? finalDueDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined;
        taskDescription = `${taskDescription} (due: ${finalDueDate.toLocaleDateString()}${
          timeLabel ? ` at ${timeLabel}` : ""
        })`;
      } else if (parsedDate?.date) {
        finalDueDate = parsedDate.date;
        taskDescription = `${taskDescription} (due: ${finalDueDate.toLocaleDateString()})`;
      }

      const response = await autoSwitchingTaskService.createTask(
        taskDescription
      );

      if (response.success) {
        setNewTaskDescription("");
        setSelectedDate("");
        setSelectedTime("");
        setActionFeedback({
          type: "success",
          message: "Task added and queued for AI enrichment.",
        });

        if (finalDueDate && response.task) {
          scheduleReminder({
            id: String(response.task.id),
            description: response.task.description,
            priority: response.task.priority,
            dueDate: finalDueDate.toISOString(),
          });
        }

        await loadTasks();
      } else {
        setActionFeedback({
          type: "error",
          message: response.error || "Failed to create task.",
        });
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setActionFeedback({
        type: "error",
        message: "We couldn't save that task. Try again in a moment.",
      });
    } finally {
      setIsWorking(false);
    }
  };

  const completeTask = async (taskId: TaskId) => {
    setIsWorking(true);
    try {
      const response = await autoSwitchingTaskService.completeTask(taskId);
      if (response.success) {
        setActionFeedback({
          type: "success",
          message: "Task marked complete.",
        });
        await cancelReminder(taskId);
        await loadTasks();
      } else if (response.error?.includes("404")) {
        removeOfflineTask(taskId);
        await cancelReminder(taskId);
        setActionFeedback({
          type: "info",
          message:
            "That task existed only on this device. It has been cleared so you can recreate it on the server.",
        });
      } else {
        setActionFeedback({
          type: "error",
          message: response.error || "Failed to complete task.",
        });
      }
    } catch (err) {
      console.error("Error completing task:", err);
      setActionFeedback({
        type: "error",
        message: "Unable to complete the task right now. Please try again.",
      });
    } finally {
      setIsWorking(false);
    }
  };

  const deleteTask = async (taskId: TaskId) => {
    setIsWorking(true);
    try {
      const response = await autoSwitchingTaskService.deleteTask(taskId);
      if (response.success) {
        removeOfflineTask(taskId);
        setActionFeedback({
          type: "success",
          message: "Task removed.",
        });
        await cancelReminder(taskId);
        await loadTasks();
      } else {
        setActionFeedback({
          type: "error",
          message: response.error || "Failed to delete task.",
        });
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      setActionFeedback({
        type: "error",
        message: "Unable to delete the task right now.",
      });
    } finally {
      setIsWorking(false);
    }
  };

  const handleTemplateSelect = (template: TaskTemplate) => {
    const draft = `${template.icon} ${template.name} — ${template.description}`;
    setNewTaskDescription(draft.trim());
    setSelectedDate("");
    setSelectedTime("");
    setTemplateSuggestions([]);
    setDateSuggestion(null);
  };

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const updateStatus = () => {
      setBackendStatus(autoSwitchingTaskService.getBackendStatus());
    };

    updateStatus();
    const interval = window.setInterval(updateStatus, 2000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (backendStatus?.isAvailable) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  }, [backendStatus?.isAvailable]);

  useEffect(() => {
    if (!actionFeedback) return;
    const timeoutId = window.setTimeout(
      () => setActionFeedback(null),
      actionFeedback.type === "error" ? 6000 : 4000
    );
    return () => window.clearTimeout(timeoutId);
  }, [actionFeedback]);

  const pendingTasks = tasks?.data.pending_tasks ?? [];
  const completedTasks = tasks?.data.completed_tasks ?? [];
  const totalTasks = pendingTasks.length + completedTasks.length;
  const completionRate = tasks
    ? Math.round(tasks.data.stats.completion_rate * 100)
    : 0;

  const connectionLabel = backendStatus
    ? backendStatus.isAvailable
      ? "Connected to Jac backend"
      : "Local simulation"
    : "Checking backend…";
  const connectionTone = backendStatus
    ? backendStatus.isAvailable
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700"
    : "bg-slate-100 text-slate-600";
  const connectionDot = backendStatus
    ? backendStatus.isAvailable
      ? "bg-emerald-500"
      : "bg-amber-500"
    : "bg-slate-400";

  return (
    <div className="min-h-screen surface-root" data-theme={theme}>
      <header className="surface-card border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-semibold text-white">
              AI
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                AI Task Manager
              </h1>
              <p className="text-sm text-slate-500">
                Plan your day with live Jac intelligence and calm, clear UI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${connectionTone}`}
            >
              <span className={`h-2 w-2 rounded-full ${connectionDot}`}></span>
              {connectionLabel}
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-base shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <span aria-hidden>{theme === "dark" ? "☀️" : "🌙"}</span>
              <span className="sr-only">Toggle theme</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {actionFeedback && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${
                actionFeedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : actionFeedback.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-sky-200 bg-sky-50 text-sky-700"
              }`}
            >
              {actionFeedback.message}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
          <section className="space-y-6">
            <div className="surface-card rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Quick capture
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                    Add your next task
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    AI assigns category and priority automatically. Prefer a
                    template? Choose one below and edit before saving.
                  </p>
                </div>
              </div>

              <form onSubmit={createTask} className="mt-6 space-y-6">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-slate-600"
                      htmlFor="task-entry"
                    >
                      Task summary
                    </label>
                    <input
                      id="task-entry"
                      type="text"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Describe what needs to happen next"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base shadow-inner transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                      disabled={isWorking}
                      autoComplete="off"
                    />
                  </div>

                  {templateSuggestions.length > 0 && (
                    <div className="surface-highlight rounded-xl border border-indigo-100 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                          AI suggestions
                        </p>
                        <button
                          type="button"
                          onClick={() => setTemplateSuggestions([])}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {templateSuggestions.map((template) => (
                          <button
                            key={`suggestion-${template.id}`}
                            type="button"
                            onClick={() => handleTemplateSelect(template)}
                            className="surface-card rounded-xl border border-indigo-100 p-3 text-left transition hover:border-indigo-200"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{template.icon}</span>
                              <span className="text-sm font-semibold text-slate-800">
                                {template.name}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {template.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="surface-muted rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Schedule
                    </p>
                    <span className="text-xs text-slate-500">
                      Provide timing so AI can prioritise the task effectively.
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-2">
                      <label
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                        htmlFor="task-due-date"
                      >
                        Due date
                      </label>
                      <input
                        type="date"
                        id="task-due-date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                        htmlFor="task-due-time"
                      >
                        Time (optional)
                      </label>
                      <input
                        type="time"
                        id="task-due-time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  </div>

                  {dateSuggestion && !selectedDate && (
                    <div className="surface-highlight mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs text-indigo-700">
                      <span>
                        AI spotted “{dateSuggestion.parsedText}” →{" "}
                        {dateSuggestion.date.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => applyDateSuggestion()}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                      >
                        Use suggestion
                      </button>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <p>
                      You can also type phrases like “tomorrow at 2pm” directly
                      into the summary — we’ll detect them automatically.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate("");
                        setSelectedTime("");
                        setDateSuggestion(null);
                      }}
                      className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isWorking || !newTaskDescription.trim()}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {isWorking ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                  ) : (
                    <span>Save task</span>
                  )}
                </button>
              </form>

              {featuredTemplates.length > 0 && (
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Quick templates
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {featuredTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateSelect(template)}
                        className="surface-muted rounded-2xl border border-slate-200 p-4 text-left text-sm text-slate-600 transition hover:border-indigo-200 hover:text-slate-700"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-lg">{template.icon}</span>
                          <span className="surface-badge rounded-full px-2 py-1 text-xs font-medium text-slate-500">
                            {template.priority}
                          </span>
                        </div>
                        <p className="mt-3 font-semibold text-slate-800">
                          {template.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {template.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isFetching && totalTasks === 0 ? (
              <div className="surface-card rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500 shadow-sm">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500"></div>
                <p className="mt-4 font-medium">Loading your tasks…</p>
              </div>
            ) : (
              <TaskList
                tasks={pendingTasks}
                title="Active tasks"
                caption="What needs attention"
                emptyMessage="🎉 All clear! Create a new task when you're ready."
                icon="🗂️"
                onComplete={completeTask}
                onDelete={deleteTask}
                isBusy={isWorking}
              />
            )}

            {completedTasks.length > 0 && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowCompleted((prev) => !prev)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  <span>{showCompleted ? "▾" : "▸"}</span>
                  <span>Completed tasks ({completedTasks.length})</span>
                </button>
                {showCompleted && (
                  <TaskList
                    tasks={completedTasks}
                    title="Completed"
                    caption="Wins so far"
                    emptyMessage="No completed tasks yet."
                    icon="✅"
                    onComplete={completeTask}
                    onDelete={deleteTask}
                    isBusy={isWorking}
                    allowComplete={false}
                  />
                )}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            {backendStatus && (
              <div className="surface-card rounded-2xl border border-slate-200 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Connection
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Backend status
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {backendStatus.isAvailable
                    ? "You're synced with the hosted Jac backend. All tasks persist to PostgreSQL."
                    : "You're in offline simulation. Tasks stay on this device until the backend is reachable."}
                </p>
                <dl className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Mode</dt>
                    <dd className="font-medium">
                      {backendStatus.mode === "jac-backend"
                        ? "Jac backend"
                        : "Local fallback"}
                    </dd>
                  </div>
                  {typeof backendStatus.tasks_count === "number" && (
                    <div className="flex items-center justify-between gap-4">
                      <dt>Server tasks</dt>
                      <dd className="font-medium">
                        {backendStatus.tasks_count}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <dt>Last checked</dt>
                    <dd className="font-medium">
                      {backendStatus.lastChecked
                        ? new Date(
                            backendStatus.lastChecked
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "–"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {(aiBrief || isBriefLoading || briefError) && (
              <div className="surface-card rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Daily brief
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      Agenda snapshot
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => void fetchAIBrief()}
                    disabled={isBriefLoading}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-progress disabled:opacity-60"
                  >
                    🔄 Refresh
                  </button>
                </div>

                {isBriefLoading ? (
                  <p className="mt-4 text-sm text-slate-500">
                    Generating a tailored brief…
                  </p>
                ) : aiBrief ? (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-slate-600">{aiBrief.summary}</p>

                    {aiBrief.agenda.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Focus blocks
                        </p>
                        <ul className="space-y-3 text-sm text-slate-600">
                          {aiBrief.agenda.map((item, index) => (
                            <li
                              key={`${item.title}-${index}`}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                            >
                              <p className="font-semibold text-slate-800">
                                {item.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {item.details}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiBrief.recommendations.length > 0 && (
                      <div className="surface-muted rounded-xl px-3 py-2 text-sm text-slate-600">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Tips from AI
                        </p>
                        <ul className="mt-2 space-y-1 text-sm">
                          {aiBrief.recommendations.map((tip, index) => (
                            <li key={`${tip}-${index}`} className="flex gap-2">
                              <span>•</span>
                              <span className="flex-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-right text-xs text-slate-400">
                      Updated{" "}
                      {new Date(aiBrief.generatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    No brief available yet. Add a task or refresh to generate
                    one.
                  </p>
                )}

                {briefError && (
                  <p className="mt-4 text-xs text-amber-600">{briefError}</p>
                )}
              </div>
            )}

            {tasks && (
              <div className="surface-card rounded-2xl border border-slate-200 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Snapshot
                </p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="surface-muted flex items-center justify-between rounded-xl px-3 py-2">
                    <span>Pending</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {tasks.data.stats.total_pending}
                    </span>
                  </div>
                  <div className="surface-muted flex items-center justify-between rounded-xl px-3 py-2">
                    <span>Completed</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {tasks.data.stats.total_completed}
                    </span>
                  </div>
                  <div className="surface-muted flex items-center justify-between rounded-xl px-3 py-2">
                    <span>Completion rate</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {completionRate}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {tasks?.data.ai_insight && (
              <div className="surface-highlight rounded-2xl border border-indigo-100 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                  AI productivity insight
                </p>
                <p className="mt-3 text-sm text-indigo-700">
                  {tasks.data.ai_insight}
                </p>
              </div>
            )}
          </aside>
        </div>

        <footer className="mt-12 text-center text-xs text-slate-400">
          <span>Powered by Jac AI • Offline smart sync • PWA ready</span>
        </footer>
      </main>
    </div>
  );
};

export default TaskManager;
