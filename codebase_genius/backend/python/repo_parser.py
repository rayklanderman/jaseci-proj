import os
import tempfile
import git
from git import Repo
import re
import networkx as nx
from pathlib import Path
from gemini_connector import GeminiConnector

def clone_repo(repo_url: str) -> str:
    """Clone the repository to a temporary directory and return the path."""
    temp_dir = tempfile.mkdtemp()
    Repo.clone_from(repo_url, temp_dir)
    return temp_dir

def generate_file_tree(repo_path: str) -> dict:
    """Generate a file tree excluding irrelevant folders."""
    tree = {}
    exclude = {'.git', 'node_modules', '__pycache__', '.env', 'venv', '.vscode', '.idea', 'dist', 'build'}

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in exclude]
        rel_root = os.path.relpath(root, repo_path)
        if rel_root == '.':
            rel_root = ''
        tree[rel_root] = files

    return tree

def parse_code(repo_path: str) -> dict:
    """Parse source files using regex and Gemini AI for intelligent analysis."""
    code_context = {}

    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    code = f.read()

                # Use regex for basic parsing
                functions = re.findall(r'def\s+(\w+)\s*\(', code)
                classes = re.findall(r'class\s+(\w+)\s*[:\(]', code)
                imports = re.findall(r'^(?:from\s+[\w.]+\s+import|import\s+[\w.]+)', code, re.MULTILINE)

                rel_path = os.path.relpath(filepath, repo_path)
                code_context[rel_path] = {
                    'functions': functions,
                    'classes': classes,
                    'imports': imports,
                    'code': code[:2000],  # First 2000 chars for AI analysis
                    'full_code': code
                }

    return code_context

def build_graph(code_context: dict) -> dict:
    """Build a Code Context Graph with AI-enhanced relationships."""
    G = nx.DiGraph()

    # Add nodes
    for file, data in code_context.items():
        for func in data['functions']:
            G.add_node(f"{file}:{func}", type='function', file=file)
        for cls in data['classes']:
            G.add_node(f"{file}:{cls}", type='class', file=file)

    # Add basic edges based on file relationships
    for file, data in code_context.items():
        for cls in data['classes']:
            for func in data['functions']:
                G.add_edge(f"{file}:{cls}", f"{file}:{func}", relation='contains')

    # Add import relationships
    file_nodes = {}
    for file in code_context.keys():
        file_nodes[file] = f"file:{file}"

    for file, data in code_context.items():
        for imp in data['imports']:
            # Simple heuristic: if import contains a filename from our codebase
            for other_file in code_context.keys():
                if other_file.replace('.py', '').replace('/', '.') in imp:
                    if file != other_file:
                        G.add_edge(f"file:{file}", f"file:{other_file}", relation='imports')

    return nx.node_link_data(G)

def analyze_code_with_ai(code_context: dict, gemini_connector: GeminiConnector) -> dict:
    """Use Gemini AI to analyze code and extract insights."""
    enhanced_context = {}

    for file_path, data in code_context.items():
        # Analyze the code with AI
        analysis_prompt = f"""
        Analyze this Python code file and provide insights:

        File: {file_path}
        Code:
        {data['code']}

        Please provide:
        1. A brief description of what this file does
        2. Key functions and their purposes
        3. Classes and their responsibilities
        4. Important design patterns or architectural decisions
        5. Dependencies and relationships

        Keep the analysis concise but informative.
        """

        try:
            analysis = gemini_connector.generate_text(analysis_prompt, temperature=0.3)
        except Exception as e:
            analysis = f"AI analysis failed: {str(e)}"

        # Analyze individual functions and classes
        function_analyses = {}
        for func in data['functions'][:5]:  # Limit to first 5 functions
            func_prompt = f"""
            Analyze this Python function:

            def {func}(...):
                # Function code would be here

            Based on the function name and typical usage patterns, what does this function likely do?
            Provide a brief description.
            """
            try:
                func_analysis = gemini_connector.generate_text(func_prompt, temperature=0.2)
                function_analyses[func] = func_analysis.strip()
            except:
                function_analyses[func] = f"Function {func} - purpose analysis unavailable"

        enhanced_context[file_path] = {
            **data,
            'ai_analysis': analysis,
            'function_descriptions': function_analyses
        }

    return enhanced_context

def generate_markdown(code_graph: dict, repo_url: str, enhanced_context: dict = None) -> str:
    """Generate comprehensive markdown documentation with AI insights."""
    G = nx.node_link_graph(code_graph)
    repo_name = repo_url.split('/')[-1]

    md = f"# 📚 {repo_name} - Codebase Documentation\n\n"
    md += f"**Repository:** {repo_url}\n\n"
    md += f"**Analysis Date:** Generated by Codebase Genius AI\n\n"

    # Overview section
    total_files = len([node for node, data in G.nodes(data=True) if data.get('type') == 'file'])
    total_classes = len([node for node, data in G.nodes(data=True) if data.get('type') == 'class'])
    total_functions = len([node for node, data in G.nodes(data=True) if data.get('type') == 'function'])

    md += "## 📊 Overview\n\n"
    md += f"- **Files Analyzed:** {len(enhanced_context) if enhanced_context else len(G.nodes)}\n"
    md += f"- **Classes:** {total_classes}\n"
    md += f"- **Functions:** {total_functions}\n"
    md += f"- **Code Relationships:** {len(G.edges)}\n\n"

    # File-by-file analysis
    if enhanced_context:
        md += "## 📁 File Analysis\n\n"
        for file_path, data in enhanced_context.items():
            md += f"### 🔍 `{file_path}`\n\n"
            md += f"**AI Analysis:** {data.get('ai_analysis', 'Analysis not available')}\n\n"

            if data.get('classes'):
                md += "**Classes:**\n"
                for cls in data['classes']:
                    md += f"- `{cls}`\n"
                md += "\n"

            if data.get('functions'):
                md += "**Functions:**\n"
                for func in data['functions']:
                    desc = data.get('function_descriptions', {}).get(func, f"Function {func}")
                    md += f"- `{func}`: {desc}\n"
                md += "\n"

            if data.get('imports'):
                md += "**Dependencies:**\n"
                for imp in data['imports'][:10]:  # Limit to first 10 imports
                    md += f"- `{imp}`\n"
                if len(data['imports']) > 10:
                    md += f"- ... and {len(data['imports']) - 10} more imports\n"
                md += "\n"

    # Code Structure Visualization
    md += "## 🏗️ Code Structure\n\n"
    md += "```mermaid\ngraph TD\n"

    # Add nodes
    for node, data in G.nodes(data=True):
        if data.get('type') == 'class':
            md += f"    {node.replace(':', '_').replace('/', '_')}([Class: {node.split(':')[-1]}])\n"
        elif data.get('type') == 'function':
            md += f"    {node.replace(':', '_').replace('/', '_')}{{Function: {node.split(':')[-1]}}}\n"

    # Add edges
    for edge in G.edges(data=True):
        source = edge[0].replace(':', '_').replace('/', '_')
        target = edge[1].replace(':', '_').replace('/', '_')
        relation = edge[2].get('relation', 'relates_to')
        md += f"    {source} -->|{relation}| {target}\n"

    md += "```\n\n"

    # Installation and Usage
    md += "## 🚀 Installation & Usage\n\n"
    md += "```bash\n"
    md += f"# Clone the repository\n"
    md += f"git clone {repo_url}\n\n"
    md += f"# Install dependencies\n"
    md += f"pip install -r requirements.txt\n\n"
    md += f"# Run the application\n"
    md += f"python main.py\n"
    md += "```\n\n"

    md += "## 🤖 Generated by Codebase Genius\n\n"
    md += "*This documentation was automatically generated using AI-powered code analysis.*\n"

    return md

def save_docs(docs: str, repo_url: str, output_dir: str = "../outputs") -> str:
    """Save documentation to file and return the file path."""
    repo_name = repo_url.split('/')[-1]
    os.makedirs(f"{output_dir}/{repo_name}", exist_ok=True)
    output_file = f"{output_dir}/{repo_name}/docs.md"

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(docs)

    return output_file