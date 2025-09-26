// Backend Detection and Auto-Switch Service
// Automatically detects if Jac backend is available and switches API modes

export interface BackendStatus {
  isAvailable: boolean;
  mode: "jac-backend" | "local-simulation";
  url?: string;
  version?: string;
  features?: string[];
  lastChecked: number;
}

class BackendDetectionService {
  private status: BackendStatus = {
    isAvailable: false,
    mode: "local-simulation",
    lastChecked: 0,
  };

  private checkInterval: number | null = null;
  private readonly JAC_BACKEND_URL = "http://localhost:8000";
  private readonly CHECK_INTERVAL = 5000; // Check every 5 seconds
  private readonly CHECK_TIMEOUT = 2000; // 2 second timeout for checks

  constructor() {
    this.startPeriodicCheck();
    // Initial check
    this.checkBackendAvailability();
  }

  /**
   * Check if Jac backend service is running
   */
  async checkBackendAvailability(): Promise<BackendStatus> {
    try {
      // Try to reach the health check endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.CHECK_TIMEOUT
      );

      const response = await fetch(`${this.JAC_BACKEND_URL}/HealthCheck`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const healthData = await response.json();

        this.status = {
          isAvailable: true,
          mode: "jac-backend",
          url: this.JAC_BACKEND_URL,
          version: healthData.version || "1.0.0",
          features: healthData.features || [],
          lastChecked: Date.now(),
        };

        console.log("🚀 Jac backend detected:", healthData);
      } else {
        throw new Error(`Backend responded with ${response.status}`);
      }
    } catch (error) {
      // Backend not available, fall back to local mode
      this.status = {
        isAvailable: false,
        mode: "local-simulation",
        lastChecked: Date.now(),
      };

      // Only log if this is a change in status
      if (this.status.mode === "jac-backend") {
        console.log("📱 Switching to local simulation mode");
      }
    }

    return this.status;
  }

  /**
   * Start periodic backend availability checking
   */
  private startPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkBackendAvailability();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop periodic checking
   */
  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get current backend status
   */
  getStatus(): BackendStatus {
    return { ...this.status };
  }

  /**
   * Force immediate backend check
   */
  async forceCheck(): Promise<BackendStatus> {
    return await this.checkBackendAvailability();
  }

  /**
   * Get the appropriate API base URL
   */
  getApiBaseUrl(): string {
    return this.status.isAvailable ? this.JAC_BACKEND_URL : "";
  }

  /**
   * Check if we should use Jac backend for API calls
   */
  useJacBackend(): boolean {
    return this.status.isAvailable && this.status.mode === "jac-backend";
  }

  /**
   * Get human-readable status message
   */
  getStatusMessage(): string {
    if (this.status.isAvailable) {
      return `🚀 Connected to Jac AI Backend (v${this.status.version})`;
    } else {
      return "📱 Running in Local Mode (no backend required)";
    }
  }

  /**
   * Get backend capabilities
   */
  getCapabilities(): { [key: string]: string } {
    if (this.status.isAvailable) {
      return {
        "AI Categorization": "Real Jac AI analysis",
        "Data Persistence": "Server-side storage",
        "Multi-user Support": "Shared data across sessions",
        "Advanced Analytics": "Server-side insights",
      };
    } else {
      return {
        "AI Categorization": "Local pattern matching",
        "Data Persistence": "Browser localStorage",
        "Single User": "Local session only",
        "Basic Analytics": "Client-side insights",
      };
    }
  }
}

// Singleton instance
export const backendDetector = new BackendDetectionService();

// Export for external use
export default backendDetector;
