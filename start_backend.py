#!/usr/bin/env python3
"""
AI Task Manager Backend Auto-Starter
Automatically starts the Jac backend service when needed
"""

import os
import sys
import time
import signal
import subprocess
import threading
from pathlib import Path
import requests

class JacBackendManager:
    def __init__(self):
        self.process = None
        self.backend_dir = Path(__file__).parent / "ai-task-manager" / "backend"
        self.jac_file = self.backend_dir / "task_manager_api.jac"
        self.port = 8000
        self.host = "localhost"
        self.check_interval = 5  # seconds

    def is_backend_running(self):
        """Check if the backend is already running"""
        try:
            response = requests.get(f"http://{self.host}:{self.port}/HealthCheck", timeout=2)
            return response.status_code == 200
        except:
            return False

    def start_backend(self):
        """Start the Jac backend service"""
        if self.is_backend_running():
            print(f"✅ Backend already running at http://{self.host}:{self.port}")
            return True

        if not self.jac_file.exists():
            print(f"❌ Jac backend file not found: {self.jac_file}")
            return False

        try:
            print(f"🚀 Starting Jac backend service...")
            print(f"📁 Working directory: {self.backend_dir}")
            print(f"📄 Jac file: {self.jac_file.name}")
            
            # Start the jac serve command
            self.process = subprocess.Popen(
                ["jac", "serve", str(self.jac_file), "--host", self.host, "--port", str(self.port)],
                cwd=self.backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # Wait a moment for the service to start
            time.sleep(3)
            
            # Check if it started successfully
            if self.is_backend_running():
                print(f"✅ Backend started successfully at http://{self.host}:{self.port}")
                print(f"🔗 Health check: http://{self.host}:{self.port}/HealthCheck")
                print(f"📊 Service info: http://{self.host}:{self.port}/ServiceInfo")
                return True
            else:
                print("❌ Backend failed to start or is not responding")
                self.stop_backend()
                return False
                
        except Exception as e:
            print(f"❌ Error starting backend: {e}")
            return False

    def stop_backend(self):
        """Stop the backend service"""
        if self.process:
            try:
                print("🛑 Stopping backend service...")
                self.process.terminate()
                self.process.wait(timeout=5)
                print("✅ Backend stopped successfully")
            except subprocess.TimeoutExpired:
                print("⚠️ Backend didn't stop gracefully, forcing...")
                self.process.kill()
                self.process.wait()
                print("✅ Backend force-stopped")
            except Exception as e:
                print(f"❌ Error stopping backend: {e}")
            finally:
                self.process = None

    def monitor_backend(self):
        """Monitor backend process and restart if needed"""
        print("👁️ Starting backend monitoring...")
        
        while True:
            try:
                if not self.is_backend_running():
                    print("⚠️ Backend not responding, attempting restart...")
                    self.start_backend()
                
                time.sleep(self.check_interval)
                
            except KeyboardInterrupt:
                print("\n🛑 Monitoring stopped by user")
                break
            except Exception as e:
                print(f"❌ Monitor error: {e}")
                time.sleep(self.check_interval)

    def start_with_monitoring(self):
        """Start backend and begin monitoring"""
        if not self.start_backend():
            return False
        
        # Start monitoring in a separate thread
        monitor_thread = threading.Thread(target=self.monitor_backend, daemon=True)
        monitor_thread.start()
        
        try:
            print("🎯 Backend is running with monitoring")
            print("💡 Frontend will automatically detect and use the backend")
            print("⌨️ Press Ctrl+C to stop")
            
            # Keep main thread alive
            while True:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n🛑 Shutting down...")
            self.stop_backend()

def main():
    manager = JacBackendManager()
    
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        # Just check if backend is running
        if manager.is_backend_running():
            print("✅ Backend is running")
            sys.exit(0)
        else:
            print("❌ Backend is not running")
            sys.exit(1)
    
    elif len(sys.argv) > 1 and sys.argv[1] == "start":
        # Start backend once
        if manager.start_backend():
            print("✅ Backend started successfully")
            sys.exit(0)
        else:
            print("❌ Failed to start backend")
            sys.exit(1)
    
    elif len(sys.argv) > 1 and sys.argv[1] == "stop":
        # Stop backend
        if manager.is_backend_running():
            # Find and kill the process (basic implementation)
            print("🛑 Attempting to stop backend...")
            # This is a simplified version - in production you'd want better process management
            try:
                response = requests.post(f"http://localhost:8000/shutdown", timeout=2)
            except:
                pass
            print("✅ Stop signal sent")
        else:
            print("ℹ️ Backend is not running")
        sys.exit(0)
    
    else:
        # Default: start with monitoring
        print("🤖 AI Task Manager Backend Auto-Starter")
        print("=" * 50)
        
        # Handle graceful shutdown
        def signal_handler(sig, frame):
            print("\n🛑 Received shutdown signal")
            manager.stop_backend()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        manager.start_with_monitoring()

if __name__ == "__main__":
    main()