import React, { useState, useEffect } from "react";
import autoSwitchingTaskService from "../services/autoSwitchingApi";
import type { BackendStatus } from "../services/backendDetector";
import type { Task } from "../types/api";
import { TaskTemplates } from "./TaskTemplates";
import { useTheme } from "../services/themeService";
import { useSmartNotifications } from "../services/smartNotifications";
import { SmartDateParser } from "../services/smartDateParser";
import type { TaskTemplate } from "../services/taskTemplates";

// Professional Icons (using SVG for consistency)
const PlusIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-slate-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-5 h-5"
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
);

const TrashIcon = () => (
  <svg
    className="w-5 h-5"
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
);

const CalendarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const TemplateIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const SunIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const BellIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const DotsIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50 border-red-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getCategoryIcon = (category?: string) => {
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

  return (
    <div
      className={`group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all duration-200 ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      {/* Priority Indicator */}
      <div className="absolute top-0 left-4 w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-sm"></div>

      <div className="flex items-start gap-4">
        {/* Completion Checkbox */}
        <button
          onClick={() => onComplete(task.id)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? "bg-blue-500 border-blue-500 text-white"
              : "border-slate-300 hover:border-blue-400"
          }`}
        >
          {task.completed && <CheckIcon />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{getCategoryIcon(task.category)}</span>
            <h3
              className={`font-medium text-slate-900 dark:text-slate-100 ${
                task.completed ? "line-through" : ""
              }`}
            >
              {task.title || task.description}
            </h3>
            {task.priority && (
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Task Meta */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            {task.category && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                {task.category}
              </span>
            )}
            {task.due_date && (
              <span className="flex items-center gap-1">
                <ClockIcon />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            <span>{new Date(task.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
          >
            <DotsIcon />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  onDelete(task.id);
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
              >
                <TrashIcon />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskManagerPro: React.FC = () => {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<string>("Medium");
  const [newTaskCategory, setNewTaskCategory] = useState<string>("Personal");
  const [newTaskDate, setNewTaskDate] = useState<string>("");
  const [newTaskTime, setNewTaskTime] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCompleted, setFilterCompleted] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("unknown");
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  // Services
  const { theme, toggleTheme } = useTheme();
  const { requestPermission, scheduleTaskReminder } = useSmartNotifications();

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
    // Only request permission if the function exists
    if (requestPermission) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await autoSwitchingTaskService.getTasks();
      console.log("📋 Raw API response:", response);

      // Handle different response structures
      let allTasks: Task[] = [];
      let backendStatus: BackendStatus = "unknown";

      if (response.success && response.data) {
        // Backend API structure
        allTasks = [
          ...(response.data.pending_tasks || []),
          ...(response.data.completed_tasks || []),
        ];
        backendStatus = "connected";
      } else if (Array.isArray(response)) {
        // Local storage structure (array of tasks)
        allTasks = response;
        backendStatus = "fallback";
      } else if (response.tasks && Array.isArray(response.tasks)) {
        // Alternative structure with tasks array
        allTasks = response.tasks;
        backendStatus = response.backend_status || "unknown";
      }

      setTasks(allTasks);
      setBackendStatus(backendStatus);

      // Calculate stats
      const total = allTasks.length;
      const completed = allTasks.filter((task) => task.completed).length;
      const pending = total - completed;
      setStats({ total, completed, pending });

      console.log(
        `📋 Tasks loaded: { total: ${total}, pending: ${pending}, completed: ${completed} }`
      );
    } catch (err) {
      setError("Failed to load tasks");
      console.error("❌ Task loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Parse date from natural language or use explicit date/time
      let dueDate: string | undefined;

      if (newTaskDate || newTaskTime) {
        // Use explicit date/time if provided
        const date = newTaskDate || new Date().toISOString().split("T")[0];
        const time = newTaskTime || "09:00";
        dueDate = `${date}T${time}:00`;
      } else {
        // Try to parse natural language from task title
        const parsed = SmartDateParser.parseFromText(newTask);
        if (parsed.date && parsed.confidence > 0.7) {
          dueDate = parsed.date.toISOString();
          console.log(
            `📅 Parsed date from "${newTask}": ${parsed.date.toLocaleDateString()} (confidence: ${
              parsed.confidence
            })`
          );
        }
      }

      const taskData = {
        title: newTask,
        description: newTaskDescription || undefined,
        priority: newTaskPriority as "Low" | "Medium" | "High",
        category: newTaskCategory,
        due_date: dueDate,
      };

      console.log("🚀 Creating task:", taskData);
      const response = await autoSwitchingTaskService.createTask(taskData);

      // Schedule notification if due date is set
      if (dueDate && response.task && scheduleTaskReminder) {
        scheduleTaskReminder(response.task, new Date(dueDate));
      }

      // Reset form
      setNewTask("");
      setNewTaskDescription("");
      setNewTaskPriority("Medium");
      setNewTaskCategory("Personal");
      setNewTaskDate("");
      setNewTaskTime("");

      // Reload tasks
      await loadTasks();

      console.log("✅ Task created successfully");
    } catch (err) {
      setError("Failed to create task");
      console.error("❌ Task creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId: number) => {
    try {
      await autoSwitchingTaskService.updateTask(taskId, { completed: true });
      await loadTasks();
      console.log("✅ Task completed:", taskId);
    } catch (err) {
      setError("Failed to complete task");
      console.error("❌ Task completion error:", err);
    }
  };

  const handleDelete = async (taskId: number) => {
    try {
      await autoSwitchingTaskService.deleteTask(taskId);
      await loadTasks();
      console.log("🗑️ Task deleted:", taskId);
    } catch (err) {
      setError("Failed to delete task");
      console.error("❌ Task deletion error:", err);
    }
  };

  const handleTemplateSelect = (template: TaskTemplate) => {
    setNewTask(template.title);
    setNewTaskDescription(template.description || "");
    setNewTaskPriority(template.priority);
    setNewTaskCategory(template.category);
    setIsTemplatesOpen(false);
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter((task) => {
    const taskTitle = task.title || task.description || "";
    const taskDesc = task.description || "";

    const matchesSearch =
      taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taskDesc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      filterPriority === "all" ||
      task.priority?.toLowerCase() === filterPriority.toLowerCase();
    const matchesCategory =
      filterCategory === "all" || task.category === filterCategory;
    const matchesCompleted =
      filterCompleted === "all" ||
      (filterCompleted === "completed" && task.completed) ||
      (filterCompleted === "pending" && !task.completed);

    return (
      matchesSearch && matchesPriority && matchesCategory && matchesCompleted
    );
  });

  return (
    <div
      className="min-h-screen bg-slate-50 transition-colors duration-200"
      data-theme={theme}
    >
      {/* Professional Header - X-inspired */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Tasks Pro ✨
                </h1>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-4">
              {/* Backend Status */}
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    backendStatus === "connected"
                      ? "bg-green-500"
                      : backendStatus === "fallback"
                      ? "bg-yellow-500"
                      : "bg-slate-400"
                  }`}
                ></div>
                <span className="text-slate-600 hidden sm:block">
                  {backendStatus === "connected"
                    ? "Connected"
                    : backendStatus === "fallback"
                    ? "Local Mode"
                    : "Unknown"}
                </span>
              </div>

              {/* Notifications */}
              <button
                onClick={() => {
                  if (requestPermission) {
                    requestPermission();
                  } else {
                    alert("Notifications not available in this browser");
                  }
                }}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
                title="Enable notifications"
              >
                <BellIcon />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  console.log("🎨 Theme toggle clicked, current theme:", theme);
                  toggleTheme();
                }}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.total}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Tasks
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.pending}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              In Progress
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Completed
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Creation Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <PlusIcon />
                <h2 className="text-lg font-semibold text-slate-900">
                  Create Task
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Task Title */}
                <div>
                  <input
                    type="text"
                    placeholder="What needs to be done?"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Task Description */}
                <div>
                  <textarea
                    placeholder="Add a description... (optional)"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                  />
                </div>

                {/* Priority & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Work">Work</option>
                      <option value="Health">Health</option>
                      <option value="Learning">Learning</option>
                    </select>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || !newTask.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <PlusIcon />
                    )}
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTemplatesOpen(true)}
                    className="px-4 py-2 text-slate-600 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <TemplateIcon />
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-2">
            {/* Search & Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  <select
                    value={filterCompleted}
                    onChange={(e) => setFilterCompleted(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Tasks</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {loading && tasks.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-2">📝</div>
                  <p className="text-slate-600">
                    {tasks.length === 0
                      ? "No tasks yet"
                      : "No tasks match your filters"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {tasks.length === 0
                      ? "Create your first task to get started!"
                      : "Try adjusting your search or filters"}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Templates Modal */}
      <TaskTemplates
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
};

export default TaskManagerPro;
