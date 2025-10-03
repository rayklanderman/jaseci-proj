# 🚀 Jaseci Framework + AI Task Manager Project

**A comprehensive demonstration of modern AI-powered development using the Jac programming language and the Jaseci framework, featuring a production-ready full-stack AI Task Manager application.**

---

## 🎯 **What is This Project?**

This repository showcases the **Jaseci framework** and **Jac programming language** - a revolutionary approach to AI-native software development. It includes:

### **🧠 The Core: Jaseci/Jac Framework**

- **Jac Language**: Graph-based programming paradigm designed for AI applications
- **byLLM Integration**: Native AI/LLM integration with type safety
- **Cloud-Native**: Scale from CLI to cloud with the same code
- **Walker Pattern**: Unique approach to data processing and AI workflows

### **🎨 The Showcase: AI Task Manager**

- **Full-Stack Application**: TypeScript React frontend + Jac backend
- **Auto-Switching Architecture**: Seamlessly switches between Jac AI backend and local mode
- **Real AI Integration**: Uses Gemini API for intelligent task categorization
- **Production Ready**: Deployed on Vercel with PWA features

---

## 📁 **Project Architecture**

```text
jaseci-proj/
├── 📚 JAC LANGUAGE LEARNING (Core Framework)
│   ├── guess_game1.jac → guess_game6.jac    # Step-by-step Jac tutorial
│   ├── hello.jac, single_entry.jac          # Basic Jac concepts
│   ├── multiple_entry.jac                   # Advanced patterns
│   └── guess_game.py                        # Python comparison
│
├── 🧠 JAC AI BACKENDS (Production Examples)
│   ├── task_manager_final.jac               # Complete AI task manager service
│   ├── ai_task_manager_gemini.jac           # Real Gemini API integration
│   ├── ai_task_manager.jac                  # CLI version with AI
│   └── ai_task_manager_service.jac          # Service architecture demo
│
├── 🎨 FULL-STACK AI TASK MANAGER (Showcase App)
│   ├── backend/                             # FastAPI + Jac integration
│   │   ├── task_manager_api.jac             # Jac REST API service
│   │   ├── main.py                          # FastAPI wrapper
│   │   └── requirements.txt                 # jaclang, byllm
│   └── frontend/                            # React + TypeScript
│       ├── src/services/
│       │   ├── autoSwitchingApi.ts          # Auto-backend detection
│       │   ├── backendDetector.ts           # Jac backend monitoring
│       │   └── backendApi.ts                # Jac API integration
│       └── components/TaskManager.tsx       # Modern UI with Tailwind
│
├── 🛠️ SETUP & DEPLOYMENT
│   ├── setup_gemini_api.py                  # AI API configuration
│   ├── start_backend.py/.ps1               # Backend automation
│   ├── vercel.json                         # Production deployment
│   └── AI_SETUP_GUIDE.md                   # Complete setup docs
│
└── 📖 COMPREHENSIVE DOCUMENTATION
    ├── INTEGRATION_GUIDE.md                # Backend integration guide
    ├── SYSTEM_ARCHITECTURE.md              # Technical deep-dive
    ├── TASK_INPUT_GUIDE.md                 # Usage examples
    ├── WEEKEND_IMPLEMENTATION_GUIDE.md     # Quick wins guide
    └── NEXT_LEVEL_IMPLEMENTATIONS.md       # Advanced features
```

---

## 🚀 **Quick Start Guide**

### **Prerequisites**

- **Python 3.13+** with pip
- **Node.js 18+** with yarn
- **Git** for version control
- **Gemini API key** (optional, for real AI features)

### **1. 🎯 Try the Jac Language (2 minutes)**

```bash
# Clone the repository
git clone https://github.com/rayklanderman/jaseci-proj.git
cd jaseci-proj

# Activate the pre-configured environment
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# source venv/bin/activate    # macOS/Linux

# Verify Jac installation
jac --version  # Should show: Jac version 0.8.7

# Run the tutorial progression
jac run hello.jac                    # Basic "Hello World"
jac run guess_game1.jac             # Jac fundamentals
jac run guess_game6.jac             # AI-enhanced with byLLM
```

### **2. 🧠 Experience AI-Powered Jac (3 minutes)**

```bash
# Run the complete AI task manager (CLI version)
jac run task_manager_final.jac

# Try real Gemini AI integration (if API key configured)
jac run ai_task_manager_gemini.jac

# Start the production-ready API service
jac serve ai-task-manager/backend/task_manager_api.jac
# → Creates REST API at http://localhost:8000
```

### **3. 🎨 Launch the Full-Stack App (5 minutes)**

```bash
# Navigate to the frontend
cd ai-task-manager/frontend

# Install dependencies
yarn install

# Start the development server
yarn dev
# → Opens http://localhost:5173

# The app automatically detects and switches between:
# 🚀 Jac AI Backend (if running)
# 📱 Local Simulation Mode (always works)
```

---

## 🧠 **The Jac Programming Language**

Jac is a **graph-based programming language** specifically designed for AI applications:

### **🔥 Key Features:**

#### **1. Walker Pattern (Unique to Jac)**

```jac
# Walkers traverse graphs and process data
walker TaskProcessor {
    has action: str;

    can start with `root entry {
        visit [root --> (`?task_hub)];
    }

    can process with task_hub entry {
        # AI-powered processing happens here
        result = categorize_with_ai(self.action);
        return result;
    }
}
```

#### **2. Native AI Integration (byLLM)**

```jac
# Direct LLM integration with type safety
from byllm import Model;
glob llm = Model(model_name="gemini/gemini-2.0-flash");

enum TaskCategory { WORK, PERSONAL, HEALTH, LEARNING }

# AI functions with automatic prompting
def categorize_task(description: str) -> TaskCategory by llm();
def get_insights(stats: dict) -> str by llm();
```

#### **3. Cloud-Native Architecture**

```bash
# Same code works locally and in cloud
jac run task_manager.jac           # Local execution
jac serve task_manager.jac         # Instant REST API
# → Automatic OpenAPI docs, health checks, monitoring
```

### **🎓 Learning Progression:**

1. **[hello.jac](hello.jac)** - Basic syntax and structure
2. **[guess_game1.jac](guess_game1.jac)** - Object-oriented patterns
3. **[guess_game2.jac](guess_game2.jac)** - Jac's `has` declarations
4. **[guess_game3.jac](guess_game3.jac)** - Implementation separation with `impl`
5. **[guess_game4.jac](guess_game4.jac)** - Walker-based graph traversal ⭐
6. **[guess_game5.jac](guess_game5.jac)** - Service architecture for cloud
7. **[guess_game6.jac](guess_game6.jac)** - Real AI integration with byLLM ⭐

---

## 🎨 **AI Task Manager: Full-Stack Showcase**

The **AI Task Manager** demonstrates Jac's capabilities in a real-world application:

### **🌟 Features:**

#### **🧠 AI-Powered Intelligence**

- **Smart Categorization**: Uses Gemini AI to categorize tasks (Work, Personal, Health, Learning)
- **Priority Suggestions**: AI-powered priority assignment (High, Medium, Low)
- **Productivity Insights**: Personalized recommendations based on completion patterns
- **Task Enhancement**: AI improves vague task descriptions to be more actionable

#### **🔄 Auto-Switching Architecture**

- **Backend Detection**: Automatically detects if Jac backend is running
- **Graceful Fallbacks**: Works offline or when backend is unavailable
- **Real-Time Switching**: Seamlessly switches between Jac AI backend and local mode
- **Status Monitoring**: Live backend status updates every 5 seconds

#### **🎯 Modern Frontend**

- **React + TypeScript**: Type-safe frontend with modern React patterns
- **Tailwind CSS**: Beautiful responsive design with glassmorphism effects
- **PWA Ready**: Installable app with offline functionality
- **Auto-Backend Detection**: Visual indicators for current backend mode

#### **☁️ Production Deployment**

- **Vercel Deployment**: Live at [https://aitask-mjgzgp05y-teamdevray.vercel.app](https://aitask-mjgzgp05y-teamdevray.vercel.app)
- **Docker Ready**: Backend containerization support
- **Environment Management**: Proper API key and configuration handling
- **Health Monitoring**: Built-in health checks and monitoring

### **🔄 How the Auto-Switching Works:**

```typescript
// Frontend automatically detects backend status
class BackendDetectionService {
  async checkBackendAvailability(): Promise<BackendStatus> {
    try {
      // Try to reach Jac backend at localhost:8000
      const response = await fetch('/HealthCheck');
      if (response.ok) {
        return { mode: "jac-backend", isAvailable: true };
      }
    } catch {
      return { mode: "local-simulation", isAvailable: false };
    }
  }
}

// API calls automatically route to available backend
async createTask(description: string): Promise<TaskResponse> {
  if (backendDetector.useJacBackend()) {
    return await jacBackendApi.createTask(description);  // Real AI
  } else {
    return await localApi.createTask(description);       // Fallback
  }
}
```

---

## 🛠️ **Development & Deployment**

### **🧪 Local Development**

```bash
# Backend development (Jac)
cd ai-task-manager/backend
jac serve task_manager_api.jac --host localhost --port 8000

# Frontend development (React)
cd ai-task-manager/frontend
yarn dev  # http://localhost:5173

# Python backend (alternative)
cd ai-task-manager/backend
python main.py  # FastAPI + Jac integration
```

### **🚀 Production Deployment**

#### **Frontend (Vercel CLI)**

```powershell
cd ai-task-manager/frontend
yarn install --frozen-lockfile
yarn build
vercel deploy --prod
```

- Set `VITE_BACKEND_BASE_URL` in Vercel → Project Settings → Environment Variables to your Railway URL (e.g. `https://your-ai-task-manager.up.railway.app`). Redeploy after changes so the bundle receives the new value.
- If the Vercel CLI is not linked yet, run `vercel link` once inside `ai-task-manager/frontend`.
- After deployment, open the live URL and perform a hard refresh (`Shift+Reload`) to activate the newest service worker.

#### **Backend (Railway CLI)**

```powershell
cd ai-task-manager/backend
railway link                       # if the service is not already linked
railway variables set \
  GEMINI_API_KEY=your-key \
  DATABASE_URL=postgresql+psycopg://user:pass@host:port/db \
  FRONTEND_ORIGINS=https://ai-task-manager-m4tueu6bm-teamdevray.vercel.app
railway up                         # builds and deploys the FastAPI service
```

- Copy the template from `ai-task-manager/backend/.env.example` when configuring Railway variables. For local development, duplicate it into `.env`.
- Provision the managed PostgreSQL add-on in Railway and use the SQLAlchemy-style connection string for `DATABASE_URL`.
- After each deploy, verify the service by hitting `https://<your-railway-domain>/HealthCheck`.
- Optional: add an UptimeRobot monitor to keep the free-tier container awake.

#### **Other Targets**

- **Docker**: `docker build -t jac-task-manager .` then `docker run -p 8000:8000 jac-task-manager`
- **Render / Fly.io / Cloud Run**: Install requirements from `ai-task-manager/backend/requirements.txt` and start with `uvicorn main:app --host 0.0.0.0 --port $PORT`.

### **🔑 AI Integration Setup**

```bash
# Set up real AI features
python setup_gemini_api.py

# Or manually set environment
$env:GEMINI_API_KEY="your_gemini_api_key"

# Test AI integration
jac run test_gemini_integration.jac
```

---

## 🎓 **Learning Resources**

### **📚 Official Documentation**

- **[Jac Language Docs](https://docs.jac-lang.org/)** - Complete language reference
- **[Jaseci Framework](https://github.com/Jaseci-Labs/jaseci)** - Core framework repository
- **[byLLM Documentation](https://github.com/Jaseci-Labs/byllm)** - AI integration library

### **📖 Included Guides**

- **[AI_SETUP_GUIDE.md](AI_SETUP_GUIDE.md)** - Complete AI integration setup
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Backend integration walkthrough
- **[SYSTEM_ARCHITECTURE.md](ai-task-manager/SYSTEM_ARCHITECTURE.md)** - Technical deep-dive
- **[TASK_INPUT_GUIDE.md](TASK_INPUT_GUIDE.md)** - Usage examples and patterns
- **[WEEKEND_IMPLEMENTATION_GUIDE.md](WEEKEND_IMPLEMENTATION_GUIDE.md)** - Quick enhancement guide

### **🎯 Tutorial Progression**

1. Start with **`hello.jac`** for basic concepts
2. Follow **`guess_game1.jac`** → **`guess_game6.jac`** for complete learning path
3. Study **`task_manager_final.jac`** for service architecture
4. Explore **`ai_task_manager_gemini.jac`** for real AI integration
5. Examine the full-stack app in **`ai-task-manager/`** for production patterns

---

## 🌟 **Why Jac + Jaseci?**

### **🚀 Revolutionary Approach**

- **AI-First**: Built from the ground up for AI applications
- **Graph-Native**: Natural representation of complex data relationships
- **Type-Safe AI**: Enums and type checking for LLM outputs
- **Scale Seamlessly**: Same code from prototype to production

### **💡 Real-World Benefits**

- **Faster AI Development**: Native LLM integration eliminates boilerplate
- **Better Architecture**: Graph-based thinking leads to cleaner designs
- **Production Ready**: Built-in health checks, monitoring, API generation
- **Future-Proof**: Designed for the AI-native software era

### **🎯 Perfect For**

- **AI/ML Engineers**: Skip the infrastructure, focus on AI logic
- **Backend Developers**: Learn modern AI-native programming patterns
- **Startups**: Rapid prototyping with production scalability
- **Researchers**: Quick experimentation with real-world deployment

---

## 🎉 **Project Highlights**

✅ **Complete Tutorial Series**: 6-step progression from basics to AI integration  
✅ **Production-Ready Code**: Full-stack app with proper architecture  
✅ **Real AI Integration**: Working Gemini API with byLLM framework  
✅ **Auto-Switching Backend**: Intelligent fallback between AI and local modes  
✅ **Modern Frontend**: TypeScript React with Tailwind CSS  
✅ **Cloud Deployment**: Live on Vercel with proper CI/CD  
✅ **Comprehensive Documentation**: Setup guides, architecture docs, tutorials  
✅ **Educational Value**: Perfect for learning Jac programming language

---

## 🤝 **Contributing**

We welcome contributions to improve the tutorial materials, add more Jac examples, or enhance the AI Task Manager application!

### **Quick Contribution Ideas:**

- Add more tutorial examples in the `guess_game` series
- Improve AI prompts and categorization accuracy
- Add new features to the task manager (calendar sync, email integration)
- Create more comprehensive documentation
- Add tests for Jac backend services
- Implement additional deployment configurations

---

## 📄 **License**

This project is for educational purposes and showcasing the Jaseci framework and Jac programming language capabilities.

---

## 🚀 **Live Demo**

**🌐 Experience the AI Task Manager:** [https://aitask-mjgzgp05y-teamdevray.vercel.app](https://aitask-mjgzgp05y-teamdevray.vercel.app)

Try both modes:

- 🚀 **With Jac Backend**: Run `jac serve ai-task-manager/backend/task_manager_api.jac` locally, then use the web app for full AI features
- 📱 **Local Mode**: Use the web app directly for offline functionality with pattern matching

---

**🎯 Built with Jac Language & the Jaseci Framework**  
_Demonstrating the future of AI-native software development_

**⭐ Star this repo if you found it helpful for learning Jac and modern AI development patterns!**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/rayklanderman/jaseci-proj.git
cd jaseci-proj
```

### 2. Activate the Virtual Environment

The repository includes a pre-configured virtual environment with all dependencies installed.

**Windows (PowerShell):**

```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**

```cmd
venv\Scripts\activate.bat
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

### 3. Verify Installation

Check that Jac is working correctly:

```bash
jac --version
```

You should see: `Jac version 0.8.7`

## Example Programs

### Hello World (`hello.jac`)

Basic Hello World program demonstrating the entry block syntax:

```jac
# hello.jac
with entry {
    print("Hello, Jac World!");
}
```

**Run it:**

```bash
jac run hello.jac
```

**Output:**

```text
Hello, Jac World!
```

### Single Entry Block (`single_entry.jac`)

Demonstrates a single entry block - the Jac equivalent to Python's `if __name__ == "__main__"`:

```jac
# Entry block - program starts here
with entry {
    print("Hello single entry block!");
}
```

**Run it:**

```bash
jac run single_entry.jac
```

### Multiple Entry Blocks (`multiple_entry.jac`)

Shows how multiple entry blocks execute in sequence:

```jac
# First entry block
with entry {
    print("Hello first entry block!");
}

# Second entry block
with entry {
    print("Hello second entry block!");
}

# Third entry block
with entry {
    print("Hello third entry block!");
}
```

**Run it:**

```bash
jac run multiple_entry.jac
```

**Output:**

```text
Hello first entry block!
Hello second entry block!
Hello third entry block!
```

## Key Concepts

### Entry Blocks

- **`with entry { }`** - Defines where program execution begins
- Equivalent to Python's `if __name__ == "__main__":`
- Multiple entry blocks execute in the order they appear
- Used to structure the main execution flow of Jac programs

## Project Structure

```text
jaseci-proj/
├── .gitignore              # Git ignore rules
├── README.md               # This file
├── hello.jac               # Basic Hello World
├── single_entry.jac        # Single entry block example
├── multiple_entry.jac      # Multiple entry blocks example
└── venv/                   # Virtual environment with jaclang installed
    ├── Scripts/            # Python executables and scripts
  ├── Lib/                # Installed packages
  └── pyvenv.cfg          # Virtual environment configuration
```

## Dependencies

The virtual environment includes:

- **jaclang** (0.8.7) - The Jac programming language
- **mypy** (1.18.2) - Static type checker
- **typing_extensions** - Extended typing support
- **pathspec** - Path specification utilities

## Development

To add new Jac programs:

1. Create a new `.jac` file
2. Write your Jac code with `with entry { }` blocks
3. Test with `jac run yourfile.jac`
4. Commit and push your changes

## Jac in a Flash Tutorial

This comprehensive tutorial evolves a simple "guess the number" game from Python to fully object-spatial Jac, introducing key language features step by step.

### Tutorial Steps

1. **[Step 0](guess_game.py)** - Python version (starting point)
2. **[Step 1](guess_game1.jac)** - Direct Jac translation with classes and methods
3. **[Step 2](guess_game2.jac)** - Using `has` for field declarations
4. **[Step 3](guess_game3.jac)** - Separating implementation with `impl`
5. **[Step 4](guess_game4.jac)** - Walker-based graph traversal
6. **[Step 5](guess_game5.jac)** - Scale-agnostic cloud deployment
7. **[Step 6](guess_game6.jac)** - AI-enhanced with byLLM integration

Each step maintains the same game behavior while demonstrating different Jac language features and paradigms.

### Running the Tutorial

Run any example with:

```bash
jac run guess_game1.jac  # Or any step number
```

For cloud deployment (Step 5+):

```bash
jac serve guess_game5.jac
```

## Learning Resources

- [Jac Documentation](https://docs.jac-lang.org/)
- [Jaseci Framework](https://github.com/Jaseci-Labs/jaseci)

## Contributing

Feel free to add more examples and learning materials to this repository!

## License

This project is for educational purposes.
