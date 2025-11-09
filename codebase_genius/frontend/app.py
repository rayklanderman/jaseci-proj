import streamlit as st
import requests
import time

# Page config
st.set_page_config(
    page_title="Codebase Genius - AI Documentation Generator",
    page_icon="🤖",
    layout="wide",
)

# Constants
BASE_URL = "http://localhost:8000"
GENERATE_DOCS_ENDPOINT = f"{BASE_URL}/walker/generate_docs"
STATUS_ENDPOINT = f"{BASE_URL}/walker/get_status"

# Initialize session state
if 'generated_docs' not in st.session_state:
    st.session_state.generated_docs = None
if 'current_repo' not in st.session_state:
    st.session_state.current_repo = None
if 'processing' not in st.session_state:
    st.session_state.processing = False

# Title and description
st.title("🤖 Codebase Genius")
st.markdown("**AI-Powered Repository Documentation Generator**")
st.markdown("Transform any GitHub repository into comprehensive, intelligent documentation using advanced AI analysis.")

# Sidebar with information
with st.sidebar:
    st.header("ℹ️ About")
    st.markdown("""
    **Codebase Genius** uses Google Gemini AI to analyze code repositories and generate detailed documentation including:

    - 📊 Code structure analysis
    - 🔍 Function and class descriptions
    - 🏗️ Architecture insights
    - 📈 Visual relationship diagrams
    - 🚀 Installation guides
    """)

    st.header("🔧 How it works")
    st.markdown("""
    1. Enter a GitHub repository URL
    2. Click "Generate Documentation"
    3. AI analyzes the codebase
    4. Download professional markdown docs
    """)

# Main content
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("📝 Repository Analysis")

    # Input section
    repo_url = st.text_input(
        "GitHub Repository URL",
        placeholder="https://github.com/microsoft/vscode",
        help="Enter the full URL of a public GitHub repository"
    )

    # Generate button
    if st.button("🚀 Generate Documentation", type="primary", use_container_width=True):
        if repo_url:
            st.session_state.processing = True
            st.session_state.current_repo = repo_url

            with st.spinner("🔄 Cloning repository and analyzing code..."):
                try:
                    payload = {"repo_url": repo_url, "session_id": ""}
                    response = requests.post(GENERATE_DOCS_ENDPOINT, json=payload, timeout=300)  # 5 minute timeout

                    if response.status_code == 200:
                        data = response.json()
                        reports = data.get("reports", [])

                        if reports:
                            report = reports[0]
                            if report.get("status") == "success":
                                docs = report.get("docs", "")
                                st.session_state.generated_docs = docs
                                st.success("✅ Documentation generated successfully!")

                                # Show preview
                                with st.expander("📖 Preview Documentation", expanded=True):
                                    st.markdown(docs)
                            else:
                                st.error(f"❌ Generation failed: {report.get('docs', 'Unknown error')}")
                        else:
                            st.error("❌ No response received from server")
                    else:
                        st.error(f"❌ Server error: {response.status_code} - {response.text}")

                except requests.exceptions.Timeout:
                    st.error("⏰ Request timed out. Large repositories may take longer to process.")
                except requests.exceptions.ConnectionError:
                    st.error("🔌 Cannot connect to backend server. Make sure the Jac server is running on port 8000.")
                except Exception as e:
                    st.error(f"❌ Unexpected error: {str(e)}")
                finally:
                    st.session_state.processing = False
        else:
            st.error("⚠️ Please enter a repository URL")

    # Status check
    if st.button("📊 Check Processing Status"):
        try:
            response = requests.post(STATUS_ENDPOINT, timeout=10)
            if response.status_code == 200:
                data = response.json()
                reports = data.get("reports", [])
                if reports:
                    status_info = reports[0]
                    st.info(f"Status: {status_info.get('message', 'Unknown')}")
                else:
                    st.info("Server is ready")
            else:
                st.error(f"Status check failed: {response.status_code}")
        except Exception as e:
            st.error(f"Cannot check status: {str(e)}")

with col2:
    st.subheader("📋 Generated Documentation")

    # Show current documentation if available
    if st.session_state.generated_docs:
        st.success(f"📄 Documentation ready for {st.session_state.current_repo.split('/')[-1] if st.session_state.current_repo else 'repository'}")

        # Download button
        st.download_button(
            label="⬇️ Download Markdown",
            data=st.session_state.generated_docs,
            file_name=f"{st.session_state.current_repo.split('/')[-1] if st.session_state.current_repo else 'repository'}_docs.md",
            mime="text/markdown",
            use_container_width=True
        )

        # Show stats
        doc_content = st.session_state.generated_docs
        lines = len(doc_content.split('\n'))
        words = len(doc_content.split())
        st.info(f"📊 Document stats: {lines} lines, {words} words")

    else:
        st.info("💡 Generate documentation to see it here")

        # Example section
        st.markdown("---")
        st.markdown("**🎯 Try these examples:**")
        examples = [
            "https://github.com/octocat/Hello-World",
            "https://github.com/microsoft/vscode",
            "https://github.com/rayklanderman/jaseci-proj"
        ]

        for example in examples:
            if st.button(f"📖 {example.split('/')[-1]}", key=f"example_{example}"):
                st.session_state.current_repo = example
                st.rerun()

# Footer
st.markdown("---")
st.markdown("Built with ❤️ using Streamlit, Jac, and Google Gemini AI")

# Processing indicator
if st.session_state.processing:
    st.info("🔄 Processing in progress... Please wait.")