// Task Templates Component
// Quick access to pre-defined task templates

import React, { useState } from "react";
import {
  TaskTemplateService,
  CustomTemplateService,
  type TaskTemplate,
} from "../services/taskTemplates";

interface TaskTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TaskTemplate) => void;
}

export const TaskTemplates: React.FC<TaskTemplatesProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const allTemplates = CustomTemplateService.getAllTemplates();
  const categories = ["All", ...new Set(allTemplates.map((t) => t.category))];

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesCategory =
      activeCategory === "All" || template.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Work":
        return "from-blue-500 to-blue-600";
      case "Personal":
        return "from-emerald-500 to-emerald-600";
      case "Health":
        return "from-rose-500 to-rose-600";
      case "Learning":
        return "from-violet-500 to-violet-600";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50 border-red-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📋 Task Templates
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">📝</div>
              <p>No templates found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${getCategoryColor(
                        template.category
                      )} text-white`}
                    >
                      <span className="text-lg">{template.icon}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          template.priority
                        )}`}
                      >
                        {template.priority}
                      </span>
                      {template.estimatedTime && (
                        <span className="text-xs text-gray-500">
                          ⏱️ {template.estimatedTime}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600">
                    {template.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${getCategoryColor(
                        template.category
                      )} text-white`}
                    >
                      {template.category}
                    </span>

                    {template.subtasks && template.subtasks.length > 0 && (
                      <span className="text-xs text-gray-500">
                        📝 {template.subtasks.length} steps
                      </span>
                    )}
                  </div>

                  {/* Subtasks Preview */}
                  {template.subtasks && template.subtasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">
                        Quick Preview:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {template.subtasks.slice(0, 2).map((subtask, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {subtask}
                          </li>
                        ))}
                        {template.subtasks.length > 2 && (
                          <li className="text-gray-400">
                            +{template.subtasks.length - 2} more steps...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredTemplates.length} template
            {filteredTemplates.length !== 1 ? "s" : ""} available
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
