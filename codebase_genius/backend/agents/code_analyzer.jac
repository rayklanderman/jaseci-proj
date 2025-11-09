node CodeAnalyzer {
    def analyze_code(repo_map: dict) -> dict {
        repo_path = repo_map["repo_path"];
        code_context = repo_parser.parse_code(repo_path);
        code_graph = repo_parser.build_graph(code_context);
        return code_graph;
    }
}