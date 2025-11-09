node DocGenie {
    def generate_docs(code_graph: dict, repo_url: str) -> str {
        docs = repo_parser.generate_markdown(code_graph, repo_url);
        return docs;
    }
}