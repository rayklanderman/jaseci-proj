# Codebase Genius - AI Documentation System

An AI-powered system that automatically generates high-quality documentation for any software repository using multi-agent architecture.

## Current Status ✅

- **Backend API**: Running on `http://localhost:8000` with mock implementation
- **Jac Server**: Multi-agent architecture functional
- **API Testing**: `/walker/generate_docs` endpoint tested and working
- **Next Steps**: Frontend setup and real Python module integration

## Features

- **Multi-Agent System**: Supervisor, RepoMapper, CodeAnalyzer, and DocGenie agents work together
- **GitHub Integration**: Clones and analyzes public repositories
- **Code Analysis**: Uses Tree-sitter for parsing source code
- **Graph Visualization**: Builds Code Context Graphs with NetworkX
- **Markdown Output**: Generates comprehensive documentation
- **Web UI**: Streamlit-based frontend for easy interaction

## Quick Start

### Backend (Currently Running)

The Jac server is already running with mock data for testing:

```bash
cd backend
jac serve main.jac
```

Test the API:

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/walker/generate_docs" -Method POST -ContentType "application/json" -Body '{"repo_url": "https://github.com/microsoft/vscode"}'
```

### Frontend Setup (Next Step)

1. Navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the app:

   ```bash
   streamlit run app.py
   ```

## Architecture

The system consists of four main agents:

1. **Supervisor**: Orchestrates the entire documentation workflow
2. **RepoMapper**: Clones repositories and generates file trees
3. **CodeAnalyzer**: Parses code and builds relationship graphs
4. **DocGenie**: Synthesizes data into final markdown documentation

## API Endpoints

- `POST /walker/generate_docs` - Generate documentation for a repo
- `POST /walker/get_status` - Check current processing status
- `POST /walker/download_docs` - Download generated documentation

## Technologies Used

- **Jac Language**: For agent orchestration and graph-based logic
- **byLLM**: Multi-tool prompting framework
- **Tree-sitter**: Code parsing and syntax analysis
- **NetworkX**: Graph construction and visualization
- **GitPython**: Repository cloning
- **Streamlit**: Web interface
- **Google Gemini**: LLM for intelligent processing

## Project Structure

```bash
codebase_genius/
├── backend/
│   ├── main.jac              # Main server and agent definitions
│   ├── python/
│   │   └── repo_parser.py    # Python utilities for repo processing
│   ├── agents/               # Agent implementations (merged in main.jac)
│   ├── outputs/              # Generated documentation storage
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── app.py                # Streamlit UI
    └── requirements.txt
```

## License

This project is for educational purposes. Please respect repository licenses and terms of service.
