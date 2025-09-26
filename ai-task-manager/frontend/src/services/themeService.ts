// Dark Mode Theme Service
// Simple dark mode implementation with persistence

import { useState, useEffect } from "react";

export type Theme = "light" | "dark" | "system";

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme: Theme = "system";
  private listeners: Set<(theme: Theme) => void> = new Set();

  private constructor() {
    this.loadTheme();
    this.initializeSystemListener();
  }

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem("ai-task-manager-theme") as Theme;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      this.currentTheme = savedTheme;
    }
    this.applyTheme();
  }

  private initializeSystemListener(): void {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (this.currentTheme === "system") {
        this.applyTheme();
      }
    });
  }

  private applyTheme(): void {
    const root = document.documentElement;
    const isDark = this.shouldUseDarkMode();

    // Set data-theme attribute
    if (isDark) {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
    }

    // Also update color-scheme for native browser controls
    root.style.colorScheme = isDark ? "dark" : "light";

    // Update theme-color meta tag for PWA
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isDark ? "#1e293b" : "#ffffff");
    }

    console.log(`🎨 Theme applied: ${isDark ? "dark" : "light"} mode`);

    // Notify listeners
    this.listeners.forEach((listener) => listener(this.currentTheme));
  }

  private shouldUseDarkMode(): boolean {
    if (this.currentTheme === "dark") return true;
    if (this.currentTheme === "light") return false;

    // System preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem("ai-task-manager-theme", theme);
    this.applyTheme();
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  isDarkMode(): boolean {
    return this.shouldUseDarkMode();
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  toggleTheme(): void {
    const nextTheme: Theme =
      this.currentTheme === "light"
        ? "dark"
        : this.currentTheme === "dark"
        ? "system"
        : "light";
    this.setTheme(nextTheme);
  }
}

// Export singleton
export const themeService = ThemeService.getInstance();

// React hook for easy integration
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(themeService.getTheme());
  const [isDark, setIsDark] = useState(themeService.isDarkMode());

  useEffect(() => {
    const unsubscribe = themeService.subscribe((newTheme) => {
      setTheme(newTheme);
      setIsDark(themeService.isDarkMode());
    });

    return unsubscribe;
  }, []);

  const toggleTheme = () => themeService.toggleTheme();
  const setThemeMode = (newTheme: Theme) => themeService.setTheme(newTheme);

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme: setThemeMode,
  };
};
