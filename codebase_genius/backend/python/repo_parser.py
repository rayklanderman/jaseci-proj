import os
import tempfile
import git
from git import Repo
import tree_sitter
import tree_sitter_python
import networkx as nx
import markdown
from pathlib import Path

def clone_repo(repo_url: str) -> str:
    """Clone the repository to a temporary directory and return the path."""
    temp_dir = tempfile.mkdtemp()
    Repo.clone_from(repo_url, temp_dir)
    return temp_dir

def generate_file_tree(repo_path: str) -> dict:
    """Generate a file tree excluding irrelevant folders."""
    tree = {}
    exclude = {'.git', 'node_modules', '__pycache__', '.env', 'venv'}
    
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in exclude]
        rel_root = os.path.relpath(root, repo_path)
        if rel_root == '.':
            rel_root = ''
        tree[rel_root] = files
    
    return tree

def parse_code(repo_path: str) -> dict:
    """Parse source files using Tree-sitter."""
    parser = tree_sitter.Parser()
    parser.set_language(tree_sitter_python.language())
    
    code_context = {}
    
    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    code = f.read()
                tree = parser.parse(bytes(code, 'utf8'))
                # Extract functions, classes, etc.
                functions = []
                classes = []
                # Simple extraction (can be improved)
                for node in tree.root_node.children:
                    if node.type == 'function_definition':
                        func_name = node.child_by_field_name('name').text.decode('utf8')
                        functions.append(func_name)
                    elif node.type == 'class_definition':
                        class_name = node.child_by_field_name('name').text.decode('utf8')
                        classes.append(class_name)
                
                rel_path = os.path.relpath(filepath, repo_path)
                code_context[rel_path] = {
                    'functions': functions,
                    'classes': classes,
                    'code': code[:1000]  # First 1000 chars
                }
    
    return code_context

def build_graph(code_context: dict) -> dict:
    """Build a Code Context Graph."""
    G = nx.DiGraph()
    
    for file, data in code_context.items():
        for func in data['functions']:
            G.add_node(f"{file}:{func}", type='function')
        for cls in data['classes']:
            G.add_node(f"{file}:{cls}", type='class')
    
    # Add edges based on simple heuristics (can be improved)
    # For now, just connect classes to functions in same file
    for file, data in code_context.items():
        for cls in data['classes']:
            for func in data['functions']:
                G.add_edge(f"{file}:{cls}", f"{file}:{func}", relation='contains')
    
    return nx.node_link_data(G)

def generate_markdown(code_graph: dict, repo_url: str) -> str:
    """Generate markdown documentation."""
    G = nx.node_link_graph(code_graph)
    
    md = f"# Codebase Documentation for {repo_url}\n\n"
    
    md += "## Overview\n\n"
    md += f"This repository contains {len(G.nodes)} code entities.\n\n"
    
    md += "## Code Structure\n\n"
    for node, data in G.nodes(data=True):
        if data['type'] == 'class':
            md += f"### Class: {node}\n\n"
        elif data['type'] == 'function':
            md += f"#### Function: {node}\n\n"
    
    md += "## Relationships\n\n"
    for edge in G.edges(data=True):
        md += f"- {edge[0]} {edge[2]['relation']} {edge[1]}\n"
    
    return md

def save_docs(docs: str, repo_url: str, output_dir: str = "./outputs") -> str:
    """Save documentation to file and return the file path."""
    repo_name = repo_url.split('/')[-1]
    os.makedirs(f"{output_dir}/{repo_name}", exist_ok=True)
    output_file = f"{output_dir}/{repo_name}/docs.md"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(docs)
    
    return output_file