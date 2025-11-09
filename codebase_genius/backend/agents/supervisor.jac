node Supervisor {
    def orchestrate(repo_url: str) -> str {
        repo_map = self.call_repo_mapper(repo_url);
        code_graph = self.call_code_analyzer(repo_map);
        docs = self.call_doc_genie(code_graph);
        return docs;
    }

    def call_repo_mapper(repo_url: str) -> dict by llm(
        method="ReAct",
        tools=([repo_parser.clone_repo, repo_parser.generate_file_tree])
    );

    def call_code_analyzer(repo_map: dict) -> dict by llm(
        method="ReAct",
        tools=([repo_parser.parse_code, repo_parser.build_graph])
    );

    def call_doc_genie(code_graph: dict) -> str by llm(
        method="ReAct",
        tools=([repo_parser.generate_markdown])
    );
}