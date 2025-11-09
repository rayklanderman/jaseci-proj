#!/usr/bin/env python3
"""
Orchestrator for Codebase Genius - coordinates repository analysis and documentation generation
"""

import sys
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from repo_parser import (
    clone_repo, generate_file_tree, parse_code, build_graph,
    analyze_code_with_ai, generate_markdown, save_docs
)
from gemini_connector import GeminiConnector

def orchestrate_documentation(repo_url: str) -> dict:
    """Main orchestration function for documentation generation."""
    try:
        # Initialize Gemini connector
        gemini_connector = GeminiConnector()

        # Step 1: Clone repository
        print("Cloning repository...", file=sys.stderr)
        repo_path = clone_repo(repo_url)

        # Step 2: Generate file tree
        print("Generating file tree...", file=sys.stderr)
        file_tree = generate_file_tree(repo_path)

        # Step 3: Parse code
        print("Parsing code...", file=sys.stderr)
        code_context = parse_code(repo_path)

        # Step 4: Build graph
        print("Building code graph...", file=sys.stderr)
        code_graph = build_graph(code_context)

        # Step 5: AI-enhanced analysis
        print("Analyzing code with AI...", file=sys.stderr)
        enhanced_context = analyze_code_with_ai(code_context, gemini_connector)

        # Step 6: Generate documentation
        print("Generating documentation...", file=sys.stderr)
        docs = generate_markdown(code_graph, repo_url, enhanced_context)

        # Step 7: Save documentation
        print("Saving documentation...", file=sys.stderr)
        output_file = save_docs(docs, repo_url)

        return {
            "status": "success",
            "repo_path": repo_path,
            "file_tree": file_tree,
            "code_graph": code_graph,
            "docs": docs,
            "output_file": output_file
        }

    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

def main():
    """Main entry point when called from command line."""
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "error": "Missing repo_url argument"}))
        sys.exit(1)

    repo_url = sys.argv[1]
    result = orchestrate_documentation(repo_url)
    print(json.dumps(result))

if __name__ == "__main__":
    main()