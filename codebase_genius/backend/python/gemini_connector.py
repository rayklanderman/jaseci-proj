import os
import google.generativeai as genai
from typing import Optional, List

class GeminiConnector:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def generate_text(self, prompt: str, temperature: float = 0.7) -> str:
        """Generate text using Gemini API."""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                )
            )
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")

    def summarize_content(self, text: str) -> str:
        """Summarize content using Gemini API."""
        prompt = f"Please provide a concise summary of the following content:\n\n{text}"
        return self.generate_text(prompt, temperature=0.3)

    def generate_embeddings(self, text: str) -> List[float]:
        """Generate embeddings for text using Gemini API."""
        try:
            result = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            raise Exception(f"Gemini embedding error: {str(e)}")

# Global instance for Jac integration
llm_connector = None

def init_gemini_client(api_key: str) -> GeminiConnector:
    """Initialize Gemini client with API key."""
    global llm_connector
    llm_connector = GeminiConnector(api_key)
    return llm_connector

def generate_text(prompt: str, temperature: float = 0.7) -> str:
    """Generate text using the global Gemini connector."""
    if llm_connector is None:
        raise ValueError("Gemini client not initialized. Call init_gemini_client first.")
    return llm_connector.generate_text(prompt, temperature)

def summarize_content(text: str) -> str:
    """Summarize content using the global Gemini connector."""
    if llm_connector is None:
        raise ValueError("Gemini client not initialized. Call init_gemini_client first.")
    return llm_connector.summarize_content(text)

def generate_embeddings(text: str) -> List[float]:
    """Generate embeddings using the global Gemini connector."""
    if llm_connector is None:
        raise ValueError("Gemini client not initialized. Call init_gemini_client first.")
    return llm_connector.generate_embeddings(text)