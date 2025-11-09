#!/usr/bin/env python3
"""
Documentation orchestrator script that can be called from Jac.
This script handles the real documentation generation using Python modules.
"""

import sys
import os
import json
import subprocess

# Add the python directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python'))

def main():
    if len(sys.argv) < 2:
        print("Usage: python orchestrator.py <repo_url>")
        sys.exit(1)

    repo_url = sys.argv[1]

    try:
        # Import our modules
        from repo_parser import clone_and_map, analyze_code, generate_docs
        from gemini_connector import GeminiConnector

        # Clone and analyze repository
        print(f"Cloning and mapping repository: {repo_url}", file=sys.stderr)
        repo_map = clone_and_map(repo_url)

        # Analyze code
        print("Analyzing code structure...", file=sys.stderr)
        code_graph = analyze_code(repo_map)

        # Generate documentation
        print("Generating documentation...", file=sys.stderr)
        docs = generate_docs(code_graph, repo_url)

        # Output the result as JSON
        result = {
            "success": True,
            "docs": docs,
            "repo_name": repo_url.split('/')[-1]
        }
        print(json.dumps(result))

    except Exception as e:
        # Return error as JSON
        error_result = {
            "success": False,
            "error": str(e),
            "repo_name": repo_url.split('/')[-1] if '/' in repo_url else "unknown"
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()