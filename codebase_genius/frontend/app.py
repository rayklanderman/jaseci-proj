import streamlit as st
import requests

# Page config
st.set_page_config(
    page_title="Codebase Genius",
    layout="wide",
)

# Constants
BASE_URL = "http://localhost:8000"
GENERATE_DOCS_ENDPOINT = f"{BASE_URL}/walker/generate_docs"
STATUS_ENDPOINT = f"{BASE_URL}/walker/get_status"
DOWNLOAD_ENDPOINT = f"{BASE_URL}/walker/download_docs"

# Title
st.title("🤖 Codebase Genius - AI Documentation Generator")

# Input
repo_url = st.text_input("Enter GitHub Repository URL", placeholder="https://github.com/user/repo")

if st.button("Generate Documentation"):
    if repo_url:
        payload = {"repo_url": repo_url, "session_id": ""}
        with st.spinner("Generating documentation..."):
            try:
                res = requests.post(GENERATE_DOCS_ENDPOINT, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    reports = data.get("reports", [])
                    if reports:
                        docs = reports[0].get("docs", "")
                        st.success("Documentation generated!")
                        st.markdown(docs)
                    else:
                        st.error("No documentation generated.")
                else:
                    st.error(f"Error: {res.status_code}")
            except Exception as e:
                st.error(f"Failed: {e}")
    else:
        st.error("Please enter a repository URL.")

# Status
if st.button("Check Status"):
    try:
        res = requests.post(STATUS_ENDPOINT)
        if res.status_code == 200:
            data = res.json()
            st.json(data)
        else:
            st.error(f"Error: {res.status_code}")
    except Exception as e:
        st.error(f"Failed: {e}")

# Download
if st.button("Download Docs"):
    try:
        res = requests.post(DOWNLOAD_ENDPOINT)
        if res.status_code == 200:
            data = res.json()
            docs = data.get("docs", "")
            st.download_button(
                label="Download Markdown",
                data=docs,
                file_name="docs.md",
                mime="text/markdown"
            )
        else:
            st.error(f"Error: {res.status_code}")
    except Exception as e:
        st.error(f"Failed: {e}")