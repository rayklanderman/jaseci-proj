import from byllm.llm { Model }
import from dotenv { load_dotenv }
import os;
import subprocess;
import json;

node Memory {}

node Session {
    has history: list = [];
    has created_at: str = "2025-01-01T00:00:00Z";

    def add_history(entry: str) {
        self.history = self.history + [entry];
    }
    def get_history -> str {
        return "\n".join(self.history[-10:]);
    }
}

node Supervisor {
    def orchestrate(repo_url: str) -> str {
        # Call Python orchestrator via subprocess
        python_cmd = os.getcwd() + "/venv/Scripts/python.exe";
        orchestrator_path = os.getcwd() + "/python/orchestrator.py";
        result = subprocess.run([python_cmd, orchestrator_path, repo_url],
                             capture_output=True, text=True, cwd=os.getcwd() + "/python");

        if result.returncode == 0 {
            response = json.loads(result.stdout);
            if response["status"] == "success" {
                return response["docs"];
            } else {
                return "# Error\n\nFailed to generate documentation: " + response["error"];
            }
        } else {
            return "# Error\n\nFailed to run orchestrator: " + result.stderr;
        }
    }

    def call_repo_mapper(repo_url: str) -> dict {
        # Mock repo mapping
        return {"repo_path": "/tmp/" + repo_url.split('/')[-1], "file_tree": "mock file tree"};
    }

    def call_code_analyzer(repo_map: dict) -> dict {
        # Mock code analysis
        return {"functions": ["func1", "func2"], "classes": ["Class1", "Class2"], "imports": ["import1", "import2"]};
    }

    def call_doc_genie(code_graph: dict, repo_url: str) -> str {
        # Mock documentation generation
        repo_name = repo_url.split('/')[-1];
        return "# " + repo_name + " Documentation\n\nGenerated mock documentation.";
    }

    can generate_docs with entry {
        session = visitor.session;
        docs = self.orchestrate(visitor.repo_url);
        session.add_history(
            "user: " + visitor.repo_url + "\nai: " + "Documentation generated"
        );
        repo_name = visitor.repo_url.split('/')[-1];
        output_file = "./outputs/" + repo_name + "/docs.md";
        report {
            "status": "success",
            "output_file": output_file,
            "docs": docs
        };
    }
}

node RepoMapper {
    def clone_and_map(repo_url: str) -> dict {
        repo_path = repo_parser.clone_repo(repo_url);
        file_tree = repo_parser.generate_file_tree(repo_path);
        return {"repo_path": repo_path, "file_tree": file_tree};
    }
}

node CodeAnalyzer {
    def analyze_code(repo_map: dict) -> dict {
        repo_path = repo_map["repo_path"];
        code_context = repo_parser.parse_code(repo_path);
        code_graph = repo_parser.build_graph(code_context);
        return code_graph;
    }
}

node DocGenie {
    def generate_docs(code_graph: dict, repo_url: str) -> str {
        docs = repo_parser.generate_markdown(code_graph, repo_url);
        return docs;
    }
}

walker generate_docs {
    has repo_url: str = "";
    has session_id: str = "";

    obj __specs__ {
        static has auth: bool = False;
    }

    can execute with `root entry {
        memory_list = [root --> (`?Memory)];
        if not memory_list {
            memory_list = root ++> Memory();
        }
        memory = memory_list[0];
        if not self.session_id {
            session_list = memory ++> Session();
            self.session = session_list[0];
        } else {
            self.session = &(self.session_id);
        }
        supervisor_node = [root --> (`?Supervisor)];
        if not supervisor_node {
            supervisor_node = root ++> Supervisor();
        }
        visit supervisor_node[0];
    }
}

walker get_status {
    obj __specs__ {
        static has auth: bool = False;
    }
    can get_status with `root entry {
        report {"status": "processing", "message": "Documentation generation in progress"};
    }
}

walker download_docs {
    obj __specs__ {
        static has auth: bool = False;
    }
    can download_docs with `root entry {
        report {"docs": "markdown content", "content_type": "text/markdown"};
    }
}

with entry {
    load_dotenv();
}
 