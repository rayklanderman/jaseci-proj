// Task Templates Service
// Pre-defined templates for common task workflows

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: "Work" | "Personal" | "Health" | "Learning" | "General";
  priority: "High" | "Medium" | "Low";
  icon: string;
  estimatedTime?: string;
  subtasks?: string[];
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // Work Templates
  {
    id: "meeting-prep",
    name: "Meeting Preparation",
    description: "Prepare for upcoming meeting",
    category: "Work",
    priority: "Medium",
    icon: "🤝",
    estimatedTime: "30 min",
    subtasks: [
      "Review agenda",
      "Prepare talking points",
      "Gather necessary documents",
      "Test video/audio equipment",
    ],
  },
  {
    id: "project-kickoff",
    name: "Project Kickoff",
    description: "Initialize new project",
    category: "Work",
    priority: "High",
    icon: "🚀",
    estimatedTime: "2 hours",
    subtasks: [
      "Define project scope",
      "Create project timeline",
      "Set up project workspace",
      "Schedule kickoff meeting",
    ],
  },
  {
    id: "weekly-review",
    name: "Weekly Review",
    description: "Review and plan for the week",
    category: "Work",
    priority: "Medium",
    icon: "📊",
    estimatedTime: "45 min",
    subtasks: [
      "Review completed tasks",
      "Analyze productivity patterns",
      "Plan upcoming week priorities",
      "Schedule important meetings",
    ],
  },

  // Personal Templates
  {
    id: "grocery-run",
    name: "Grocery Shopping",
    description: "Weekly grocery shopping",
    category: "Personal",
    priority: "Medium",
    icon: "🛒",
    estimatedTime: "1 hour",
    subtasks: [
      "Check pantry inventory",
      "Plan meals for the week",
      "Create shopping list",
      "Check store hours",
    ],
  },
  {
    id: "home-maintenance",
    name: "Home Maintenance",
    description: "Monthly home checkup",
    category: "Personal",
    priority: "Low",
    icon: "🏠",
    estimatedTime: "2 hours",
    subtasks: [
      "Check air filters",
      "Inspect plumbing",
      "Test smoke detectors",
      "Clean appliances",
    ],
  },

  // Health Templates
  {
    id: "workout-plan",
    name: "Workout Session",
    description: "Complete daily workout",
    category: "Health",
    priority: "High",
    icon: "💪",
    estimatedTime: "1 hour",
    subtasks: [
      "Warm up (10 min)",
      "Strength training (30 min)",
      "Cardio (15 min)",
      "Cool down and stretch (5 min)",
    ],
  },
  {
    id: "meal-prep",
    name: "Meal Preparation",
    description: "Prepare healthy meals for the week",
    category: "Health",
    priority: "Medium",
    icon: "🥗",
    estimatedTime: "3 hours",
    subtasks: [
      "Plan balanced meals",
      "Shop for ingredients",
      "Prep vegetables",
      "Cook and portion meals",
    ],
  },

  // Learning Templates
  {
    id: "study-session",
    name: "Study Session",
    description: "Focused learning time",
    category: "Learning",
    priority: "Medium",
    icon: "📚",
    estimatedTime: "2 hours",
    subtasks: [
      "Review previous material",
      "Read new chapter/content",
      "Take notes",
      "Practice exercises",
    ],
  },
  {
    id: "skill-practice",
    name: "Skill Practice",
    description: "Practice new skill",
    category: "Learning",
    priority: "Low",
    icon: "🎯",
    estimatedTime: "1 hour",
    subtasks: [
      "Set practice goal",
      "Follow tutorial/guide",
      "Apply in practice project",
      "Document learnings",
    ],
  },

  // General Templates
  {
    id: "digital-declutter",
    name: "Digital Declutter",
    description: "Organize digital workspace",
    category: "General",
    priority: "Low",
    icon: "💻",
    estimatedTime: "1.5 hours",
    subtasks: [
      "Clean up desktop",
      "Organize files and folders",
      "Delete unnecessary files",
      "Update software",
    ],
  },
];

export class TaskTemplateService {
  static getTemplates(): TaskTemplate[] {
    return TASK_TEMPLATES;
  }

  static getTemplatesByCategory(category: string): TaskTemplate[] {
    return TASK_TEMPLATES.filter(
      (template) => template.category.toLowerCase() === category.toLowerCase()
    );
  }

  static getTemplate(id: string): TaskTemplate | undefined {
    return TASK_TEMPLATES.find((template) => template.id === id);
  }

  static createTaskFromTemplate(
    templateId: string,
    customDescription?: string
  ): {
    description: string;
    category: string;
    priority: string;
  } | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    return {
      description: customDescription || template.description,
      category: template.category,
      priority: template.priority,
    };
  }

  static searchTemplates(query: string): TaskTemplate[] {
    const lowerQuery = query.toLowerCase();
    return TASK_TEMPLATES.filter(
      (template) =>
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.subtasks?.some((subtask) =>
          subtask.toLowerCase().includes(lowerQuery)
        )
    );
  }
}

// Custom templates (user-defined)
export class CustomTemplateService {
  private static STORAGE_KEY = "ai-task-manager-custom-templates";

  static getCustomTemplates(): TaskTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveCustomTemplate(template: Omit<TaskTemplate, "id">): TaskTemplate {
    const customTemplates = this.getCustomTemplates();
    const newTemplate: TaskTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
    };

    customTemplates.push(newTemplate);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));

    return newTemplate;
  }

  static deleteCustomTemplate(id: string): boolean {
    const customTemplates = this.getCustomTemplates();
    const filteredTemplates = customTemplates.filter((t) => t.id !== id);

    if (filteredTemplates.length < customTemplates.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTemplates));
      return true;
    }

    return false;
  }

  static getAllTemplates(): TaskTemplate[] {
    return [...TASK_TEMPLATES, ...this.getCustomTemplates()];
  }
}
