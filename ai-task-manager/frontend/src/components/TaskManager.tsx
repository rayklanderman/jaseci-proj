import React, { useState, useEffect, useMemo, useCallback } from "react";
import autoSwitchingTaskService from "../services/autoSwitchingApi";
import type { BackendStatus } from "../services/backendDetector";
import type { Task, TaskId, TaskListResponse, AIBriefData } from "../types/api";
import { TaskTemplates } from "./TaskTemplates";
import { useTheme } from "../services/themeService";
import { useSmartNotifications } from "../services/smartNotifications";
import { SmartDateParser } from "../services/smartDateParser";
import type { TaskTemplate } from "../services/taskTemplates";
import {
  CustomTemplateService,
  TaskTemplateService,
} from "../services/taskTemplates";

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: TaskId) => void;
  onDelete: (taskId: TaskId) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Work":
        return "from-blue-500 to-blue-600 bg-gradient-to-br";
      case "Personal":
        return "from-emerald-500 to-emerald-600 bg-gradient-to-br";
      case "Health":
        return "from-rose-500 to-rose-600 bg-gradient-to-br";
      case "Learning":
        return "from-violet-500 to-violet-600 bg-gradient-to-br";
      default:
        return "from-slate-500 to-slate-600 bg-gradient-to-br";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Work":
        return "💼";
      case "Personal":
        return "🏠";
      case "Health":
        return "💪";
      case "Learning":
        return "📚";
      default:
        return "📝";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "High":
        return "border-red-400 bg-red-50";
      case "Medium":
        return "border-yellow-400 bg-yellow-50";
      case "Low":
        return "border-green-400 bg-green-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
        task.completed
          ? "bg-gray-50/80 backdrop-blur-sm border-gray-200 opacity-70"
          : `${getPriorityColor(
              task.priority
            )} backdrop-blur-lg shadow-lg hover:border-indigo-400`
      }`}
    >
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {typeof task.aiConfidence === "number" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            🤖 Confidence {Math.round(task.aiConfidence * 100)}%
          </span>
        )}
        {task.aiTags?.map((tag) => (
          <span
            key={`${task.id}-${tag}`}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-500"
          >
            #{tag}
          </span>
        ))}
      </div>

      {task.aiReasoning && (
        <p className="mt-2 text-sm text-slate-500">{task.aiReasoning}</p>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div
              className={`p-3 rounded-xl ${getCategoryColor(
                task.category
              )} text-white shadow-lg`}
            >
              <span className="text-lg">{getCategoryIcon(task.category)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                    task.category
                  )} text-white shadow-md`}
                >
                  {task.category}
                </span>
                {task.priority && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {task.priority}
                  </span>
                )}
                <span className="text-xs text-gray-400 font-mono">
                  #{task.id}
                </span>
              </div>

              <p
                className={`text-lg font-medium leading-relaxed ${
                  task.completed
                    ? "line-through text-gray-400"
                    : "text-gray-800 group-hover:text-gray-900"
                }`}
              >
                {task.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            {!task.completed && (
              <button
                onClick={() => onComplete(task.id)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-emerald-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Complete
              </button>
            )}
            <button
              onClick={() => onDelete(task.id)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-medium rounded-xl hover:from-rose-600 hover:to-rose-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-rose-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {task.completed && (
        <div className="absolute top-4 right-4">
          <div className="p-2 bg-emerald-500 text-white rounded-full shadow-lg">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskListProps {
  tasks: Task[];
  onComplete: (taskId: TaskId) => void;
  onDelete: (taskId: TaskId) => void;
  title: string;
  emptyMessage: string;
  icon: string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onComplete,
  onDelete,
  title,
  emptyMessage,
  icon,
}) => {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xl">{icon}</span>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          {title}
        </h2>
        <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
          {tasks.length}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-2xl mb-4 opacity-50">📝</div>
          <p className="text-xl text-gray-400 font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<TaskListResponse | null>(null);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(
    null
  );

  // New feature state
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showDateTimeInputs, setShowDateTimeInputs] = useState(false);
  const [aiBrief, setAIBrief] = useState<AIBriefData | null>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);

  const taskLookup = useMemo(() => {
    if (!tasks) return new Map<TaskId, Task>();
    const map = new Map<TaskId, Task>();
    tasks.data.pending_tasks.forEach((task) => map.set(task.id, task));
    tasks.data.completed_tasks.forEach((task) => map.set(task.id, task));
    return map;
  }, [tasks]);

  // Initialize services
  const { theme, toggleTheme } = useTheme();
  const { scheduleReminder } = useSmartNotifications();

  const featuredTemplates = useMemo(() => {
    const builtIns = TaskTemplateService.getTemplates();
    const customs = CustomTemplateService.getCustomTemplates();

    return [...customs, ...builtIns].slice(0, 8);
  }, []);

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
          response.error ||
            "AI brief is in fallback mode. We'll keep trying to reach the backend."
        );
      }
    } catch (error) {
      console.error("Error generating AI daily brief:", error);
      setBriefError("Unable to generate the AI brief right now.");
    } finally {
      setIsBriefLoading(false);
    }
  }, []);

  // Update backend status periodically
  useEffect(() => {
    const updateStatus = () => {
      setBackendStatus(autoSwitchingTaskService.getBackendStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await autoSwitchingTaskService.getTasks();
      if (response.success) {
        setTasks(response);
        void fetchAIBrief();
      } else {
        setError("Failed to load tasks");
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      setError("Unable to connect to the AI Task Manager service.");
    }
    setIsLoading(false);
  }, [fetchAIBrief]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDescription.trim()) return;

    setIsLoading(true);
    try {
      // Parse smart dates from task description first
      const parsedDate = SmartDateParser.parseFromText(newTaskDescription);
      let taskDescription = newTaskDescription.trim();
      let finalDueDate: Date | null = null;

      // Check if explicit date/time was provided
      if (selectedDate) {
        // Combine selected date and time
        const dateTime = selectedTime
          ? `${selectedDate}T${selectedTime}`
          : `${selectedDate}T09:00`; // Default to 9 AM if no time specified

        finalDueDate = new Date(dateTime);
        taskDescription = `${taskDescription} (due: ${finalDueDate.toLocaleDateString()} at ${finalDueDate.toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" }
        )})`;
      } else if (parsedDate?.date) {
        // Use smart-parsed date if no explicit date provided
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
        setShowDateTimeInputs(false);

        // Schedule smart notifications for the new task if it has a due date
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
        setError(response.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Failed to create task");
    }
    setIsLoading(false);
  };

  const completeTask = async (taskId: TaskId) => {
    setIsLoading(true);
    try {
      const response = await autoSwitchingTaskService.completeTask(taskId);
      if (response.success) {
        await loadTasks();
      } else {
        setError(response.error || "Failed to complete task");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      setError("Failed to complete task");
    }
    setIsLoading(false);
  };

  const deleteTask = async (taskId: TaskId) => {
    setIsLoading(true);
    try {
      const response = await autoSwitchingTaskService.deleteTask(taskId);
      if (response.success) {
        await loadTasks();
      } else {
        setError(response.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task");
    }
    setIsLoading(false);
  };

  // Handle template selection
  const handleTemplateSelect = (template: TaskTemplate) => {
    const draft = `${template.icon} ${template.name} — ${template.description}`;
    setNewTaskDescription(draft.trim());
    setSelectedDate("");
    setSelectedTime("");
    setShowDateTimeInputs(false);
    setIsTemplatesOpen(false);
  };

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const getCompletionRate = () => {
    if (!tasks?.data.stats) return 0;
    return Math.round(tasks.data.stats.completion_rate * 100);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18)_0,_rgba(226,232,240,0.92)_40%,_rgba(248,250,252,1)_75%)] text-slate-800">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
        <header className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="relative overflow-hidden rounded-4xl border border-white/60 bg-surface-100 p-10 shadow-card backdrop-blur-xl">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600">
              <span>AI Productivity Workspace</span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
            </div>
            <h1 className="mt-6 font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
              AI Task Manager
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Orchestrate tasks, insights, and intelligent reminders inside a
              calm, professional dashboard powered by Tailwind CSS 4.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/10 text-xl text-brand-600">
                  🤖
                </span>
                <div>
                  <p className="font-medium text-slate-900">
                    Jac AI integration
                  </p>
                  <p className="text-xs text-slate-500">
                    Real-time enrichment & categorisation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-xl text-emerald-600">
                  🔔
                </span>
                <div>
                  <p className="font-medium text-slate-900">Smart reminders</p>
                  <p className="text-xs text-slate-500">
                    Service worker & notifications enabled
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 rounded-full border border-white/50 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-white">
                  {theme === "dark" ? "☀️" : "🌙"}
                </span>
                <span>Toggle theme</span>
              </button>
            </div>

            <div className="relative overflow-hidden rounded-4xl border border-white/60 bg-white/85 p-8 shadow-card backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Quick add
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Capture your next task instantly
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    AI-enriched categorisation happens as soon as you save, so
                    you can stay in flow.
                  </p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-3xl bg-brand-500/10 text-2xl text-brand-600">
                  ⚡
                </span>
              </div>

              <form onSubmit={createTask} className="mt-6 space-y-5">
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-slate-600"
                    htmlFor="task-entry"
                  >
                    Task summary
                  </label>
                  <div className="relative">
                    <input
                      id="task-entry"
                      type="text"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Describe your task... AI will automatically categorise it ✨"
                      className="w-full rounded-2xl border-2 border-slate-200/60 bg-white/90 px-5 py-4 text-base shadow-inner transition-all duration-300 placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
                      disabled={isLoading}
                    />
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDateTimeInputs(!showDateTimeInputs)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      showDateTimeInputs
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200/70 bg-white/90 text-slate-600 hover:border-brand-200 hover:text-brand-600"
                    }`}
                  >
                    <span>📅</span>
                    <span>Schedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTemplatesOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/90 px-4 py-2 text-sm font-medium text-indigo-600 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <span>📋</span>
                    <span>Browse templates</span>
                  </button>
                </div>

                {showDateTimeInputs && (
                  <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Due date
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          aria-label="Task due date"
                          className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white px-3 py-3 text-sm shadow-inner transition-all duration-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-300/40"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Due time (optional)
                        </label>
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          aria-label="Task due time"
                          className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white px-3 py-3 text-sm shadow-inner transition-all duration-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-300/40"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate("");
                            setSelectedTime("");
                            setShowDateTimeInputs(false);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200/60 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-200"
                        >
                          <span>✕</span>
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>
                    <p className="mt-4 rounded-xl bg-slate-50/80 px-4 py-2 text-xs text-slate-500">
                      💡 Tip: you can still drop phrases like "tomorrow at 3pm"
                      directly in the task summary.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !newTaskDescription.trim()}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-brand-600 hover:to-indigo-700 hover:shadow-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add task
                    </>
                  )}
                </button>
              </form>

              {featuredTemplates.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Featured templates
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsTemplatesOpen(true)}
                      className="text-sm font-medium text-brand-600 hover:text-brand-500"
                    >
                      View all
                    </button>
                  </div>
                  <div className="-mx-2 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 px-2">
                    {featuredTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateSelect(template)}
                        className="group relative min-w-[220px] snap-start rounded-3xl border border-white/60 bg-white/80 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/10 text-lg">
                            {template.icon}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                            {template.priority}
                          </span>
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-800 group-hover:text-brand-600">
                          {template.name}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                          {template.description}
                        </p>
                        {template.estimatedTime && (
                          <p className="mt-3 text-xs font-medium text-slate-400">
                            ⏱ {template.estimatedTime}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.75fr)]">
          <div className="space-y-6">
            {backendStatus && (
              <div
                className={`rounded-3xl border border-white/60 px-6 py-5 shadow-card backdrop-blur ${
                  backendStatus.isAvailable
                    ? "bg-emerald-50/80"
                    : "bg-sky-50/80"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-2xl text-lg text-white ${
                        backendStatus.isAvailable
                          ? "bg-emerald-500"
                          : "bg-sky-500"
                      }`}
                    >
                      {backendStatus.isAvailable ? "🚀" : "📱"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {backendStatus.isAvailable
                          ? "Jac AI backend active"
                          : "Local intelligent mode"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {backendStatus.isAvailable
                          ? `Version ${backendStatus.version} • real-time enrichment`
                          : "Pattern analysis with offline persistence"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[0.7rem] text-slate-600">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          backendStatus.isAvailable
                            ? "bg-emerald-500"
                            : "bg-sky-500"
                        }`}
                      ></span>
                      {backendStatus.mode.replace("-", " ")}
                    </span>
                    {backendStatus.tasks_count !== undefined && (
                      <span>{backendStatus.tasks_count} tasks synced</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-3xl border border-red-100 bg-red-50/90 px-6 py-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-red-500 text-white">
                    ⚠️
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Something went wrong
                    </p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {isLoading && !tasks && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/85 px-6 py-16 text-center shadow-card">
                <span className="h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></span>
                <p className="mt-4 text-sm font-medium text-slate-600">
                  Warming up your AI workspace...
                </p>
              </div>
            )}

            {tasks && (
              <div className="space-y-8">
                <TaskList
                  tasks={tasks.data.pending_tasks}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                  title="Pending Tasks"
                  emptyMessage="🎉 All caught up! No pending tasks."
                  icon="🔄"
                />

                {tasks.data.completed_tasks.length > 0 && (
                  <TaskList
                    tasks={tasks.data.completed_tasks}
                    onComplete={completeTask}
                    onDelete={deleteTask}
                    title="Completed Tasks"
                    emptyMessage="No completed tasks yet."
                    icon="✅"
                  />
                )}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {(aiBrief || isBriefLoading || briefError) && (
              <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                      Daily brief
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      AI agenda coach
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                        aiBrief?.aiAvailable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {aiBrief?.aiAvailable ? "Gemini" : "Local"}
                    </span>
                    <button
                      type="button"
                      onClick={() => void fetchAIBrief()}
                      disabled={isBriefLoading}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200/70 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>

                {isBriefLoading ? (
                  <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500"></span>
                    Generating your brief...
                  </div>
                ) : aiBrief ? (
                  <div className="mt-4 space-y-5">
                    <p className="text-sm text-slate-600">{aiBrief.summary}</p>

                    {aiBrief.agenda.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Agenda
                        </p>
                        <div className="space-y-3">
                          {aiBrief.agenda.map((item, index) => {
                            const relatedTasks = item.relatedTaskIds
                              .map((id) => taskLookup.get(id))
                              .filter((task): task is Task => Boolean(task));

                            return (
                              <div
                                key={`${item.title}-${index}`}
                                className="rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                      {item.title}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {item.details}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
                                    {item.priority && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 font-medium">
                                        ⭐ {item.priority}
                                      </span>
                                    )}
                                    {item.suggestedTime && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 font-medium text-indigo-600">
                                        🕑 {item.suggestedTime}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {relatedTasks.length > 0 ? (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                                      Linked tasks
                                    </p>
                                    <div className="space-y-2">
                                      {relatedTasks.map((relatedTask) => (
                                        <div
                                          key={relatedTask.id}
                                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white/90 px-3 py-2"
                                        >
                                          <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-slate-700">
                                              {relatedTask.description}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.65rem] text-slate-500">
                                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                                                {relatedTask.category}
                                              </span>
                                              {relatedTask.priority && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-600">
                                                  {relatedTask.priority}
                                                </span>
                                              )}
                                              {relatedTask.due_date && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-600">
                                                  ⏰
                                                  {new Date(
                                                    relatedTask.due_date
                                                  ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                      month: "short",
                                                      day: "numeric",
                                                    }
                                                  )}
                                                </span>
                                              )}
                                              {typeof relatedTask.aiConfidence ===
                                                "number" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600">
                                                  🤖
                                                  {Math.round(
                                                    relatedTask.aiConfidence *
                                                      100
                                                  )}
                                                  %
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          {relatedTask.completed ? (
                                            <span className="text-xs font-semibold text-emerald-600">
                                              Done
                                            </span>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                void completeTask(
                                                  relatedTask.id
                                                )
                                              }
                                              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 transition-colors duration-200 hover:border-emerald-300 hover:bg-emerald-100"
                                            >
                                              ✅ Mark done
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : item.relatedTaskIds.length > 0 ? (
                                  <p className="mt-2 text-xs text-slate-400">
                                    Linked tasks:{" "}
                                    {item.relatedTaskIds.join(", ")}
                                  </p>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {aiBrief.recommendations.length > 0 && (
                      <div className="rounded-2xl bg-slate-50/80 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Recommendations
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-slate-600">
                          {aiBrief.recommendations.map((tip, index) => (
                            <li
                              key={`${tip}-${index}`}
                              className="flex items-start gap-2"
                            >
                              <span className="mt-1 text-brand-500">•</span>
                              <span>{tip}</span>
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
              <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Snapshot
                </p>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/95 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/10 text-xl text-blue-600">
                        ⏳
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Pending
                        </p>
                        <p className="text-xs text-slate-500">
                          In progress now
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-slate-900">
                      {tasks.data.stats.total_pending}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/95 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/10 text-xl text-emerald-600">
                        ✅
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Completed
                        </p>
                        <p className="text-xs text-slate-500">
                          Wins this cycle
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-slate-900">
                      {tasks.data.stats.total_completed}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/95 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/10 text-xl text-violet-600">
                        📈
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Completion rate
                        </p>
                        <p className="text-xs text-slate-500">
                          7-day rolling trend
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-slate-900">
                      {getCompletionRate()}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {tasks?.data.ai_insight && (
              <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-indigo-500/12 via-purple-500/12 to-pink-500/12 p-6 shadow-card backdrop-blur">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500 text-white">
                    💡
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      AI productivity insight
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {tasks.data.ai_insight}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Workspace advantages
              </p>
              <ul className="mt-4 space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-brand-500">•</span>
                  <span>
                    Offline-first architecture with local storage fallback and
                    smart sync once the Jac backend is back online.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-brand-500">•</span>
                  <span>
                    Service worker covers the Vite asset pipeline and keeps API
                    traffic live, preventing stale responses.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-brand-500">•</span>
                  <span>
                    Featured templates and AI parsing reduce manual entry so
                    teams can log tasks in seconds.
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </section>

        {/* Footer */}
        <div className="text-center mt-20 pb-8">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/40 backdrop-blur-xl border border-white/20 rounded-full shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-slate-600">
                Powered by Jac Language & AI
              </span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <span className="text-sm font-medium text-slate-600">
              TypeScript React Frontend
            </span>
          </div>
        </div>
      </div>

      {/* Task Templates Modal */}
      {isTemplatesOpen && (
        <TaskTemplates
          isOpen={isTemplatesOpen}
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setIsTemplatesOpen(false)}
        />
      )}
    </div>
  );
};

export default TaskManager;
