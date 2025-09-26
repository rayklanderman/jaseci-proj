import React, { useState, useEffect } from "react";
import autoSwitchingTaskService from "../services/autoSwitchingApi";
import type { BackendStatus } from "../services/backendDetector";
import type { Task, TaskListResponse } from "../types/api";
import { TaskTemplates } from "./TaskTemplates";
import { useTheme } from "../services/themeService";
import { useSmartNotifications } from "../services/smartNotifications";
import { SmartDateParser } from "../services/smartDateParser";
import type { TaskTemplate } from "../services/taskTemplates";

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: number) => void;
  onDelete: (taskId: number) => void;
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
  onComplete: (taskId: number) => void;
  onDelete: (taskId: number) => void;
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

  // Initialize services
  const { theme, toggleTheme } = useTheme();
  const { scheduleReminder } = useSmartNotifications();

  // Update backend status periodically
  useEffect(() => {
    const updateStatus = () => {
      setBackendStatus(autoSwitchingTaskService.getBackendStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await autoSwitchingTaskService.getTasks();
      if (response.success) {
        setTasks(response);
      } else {
        setError("Failed to load tasks");
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      setError("Unable to connect to the AI Task Manager service.");
    }
    setIsLoading(false);
  };

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

  const completeTask = async (taskId: number) => {
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

  const deleteTask = async (taskId: number) => {
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
    setNewTaskDescription(template.description);
    setIsTemplatesOpen(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const getCompletionRate = () => {
    if (!tasks?.data.stats) return 0;
    return Math.round(tasks.data.stats.completion_rate * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-black bg-gradient-to-r from-slate-800 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Task Manager
                </h1>
                <p className="text-xl text-slate-600 mt-2 font-medium">
                  Intelligent productivity with AI-powered insights
                </p>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-3 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg hover:bg-white/90 transition-all duration-200"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <span className="text-xl">{theme === "dark" ? "☀️" : "🌙"}</span>
            </button>
          </div>
        </div>

        {/* Backend Status Indicator */}
        {backendStatus && (
          <div className="max-w-2xl mx-auto mb-8">
            <div
              className={`bg-white/70 backdrop-blur-xl border rounded-2xl px-6 py-4 shadow-lg transition-all duration-300 ${
                backendStatus.isAvailable
                  ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
                  : "border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      backendStatus.isAvailable
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <span className="text-sm">
                      {backendStatus.isAvailable ? "🚀" : "📱"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {backendStatus.isAvailable
                        ? "Jac AI Backend Active"
                        : "Local Mode Active"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {backendStatus.isAvailable
                        ? `Real AI processing • v${backendStatus.version}`
                        : "Pattern matching • Browser storage"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      backendStatus.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        backendStatus.isAvailable
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    ></div>
                    {backendStatus.mode.replace("-", " ").toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Dashboard */}
        {tasks && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                  <svg
                    className="w-6 h-6"
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
                </div>
                <div>
                  <div className="text-3xl font-black text-blue-600">
                    {tasks.data.stats.total_pending}
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    Pending Tasks
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white shadow-lg">
                  <svg
                    className="w-6 h-6"
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
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-600">
                    {tasks.data.stats.total_completed}
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    Completed
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl text-white shadow-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-black text-violet-600">
                    {getCompletionRate()}%
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    Success Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Insight */}
        {tasks?.data.ai_insight && (
          <div className="relative mb-12">
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg flex-shrink-0">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    AI Productivity Insight
                  </h3>
                  <p className="text-lg text-slate-700 font-medium leading-relaxed">
                    {tasks.data.ai_insight}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Task Form */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white shadow-lg">
              <svg
                className="w-6 h-6"
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
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Create New Task
            </h2>
          </div>

          <form onSubmit={createTask} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Describe your task... AI will automatically categorize it ✨"
                className="w-full px-6 py-4 text-lg bg-white/90 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 placeholder-slate-400 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>

            {/* Template Button */}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsTemplatesOpen(true)}
                className="px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-indigo-200/50 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-sm">📋</span>
                <span className="text-sm font-medium">Use Template</span>
              </button>

              {/* Date/Time Toggle Button */}
              <button
                type="button"
                onClick={() => setShowDateTimeInputs(!showDateTimeInputs)}
                className={`px-4 py-2 backdrop-blur-sm border-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  showDateTimeInputs
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-white/70 border-slate-200/50 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-sm">📅</span>
                <span className="text-sm font-medium">Set Date & Time</span>
              </button>
            </div>

            {/* Date/Time Inputs */}
            {showDateTimeInputs && (
              <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      📅 Due Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white/90 border-2 border-slate-200/50 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      ⏰ Due Time (optional)
                    </label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 bg-white/90 border-2 border-slate-200/50 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300"
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
                      className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all duration-200 flex items-center gap-2"
                    >
                      <span className="text-sm">✕</span>
                      <span className="text-sm font-medium">Clear</span>
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500 bg-slate-50/50 rounded-xl p-3">
                  💡 <strong>Tip:</strong> You can still use natural language
                  like "tomorrow at 3pm" in the task description, or use these
                  fields for precise date/time control.
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !newTaskDescription.trim()}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-semibold rounded-2xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-3">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Task
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-xl border-2 border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500 text-white rounded-xl flex-shrink-0">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-1">
                  Something went wrong
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !tasks && (
          <div className="text-center py-24">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-xl text-slate-600 font-medium">
              Loading your intelligent workspace...
            </p>
          </div>
        )}

        {/* Task Lists */}
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
