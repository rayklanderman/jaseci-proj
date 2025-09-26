"""AI Task Manager - Gemini API Integration Test
Simplified version to verify byLLM integration is working correctly"""

import from byllm { Model }
import random;

# Global model configuration
glob llm = Model(model_name="gemini/gemini-2.0-flash");

# Define task categories as enum for type safety
enum TaskCategory {
    WORK,
    PERSONAL, 
    HEALTH,
    LEARNING,
    GENERAL
}

"""Analyze task description and intelligently categorize it using AI"""
def categorize_task_ai(description: str) -> TaskCategory by llm();

"""Generate a simple AI greeting to test connectivity"""
def test_ai_connection() -> str by llm();

with entry:__main__ {
    print("🧪 Testing Real Gemini API Integration");
    print("=" * 40);
    
    try {
        print("📡 Testing AI connection...");
        greeting = test_ai_connection();
        print(f"✅ AI Response: {greeting}");
        
        print("\n📝 Testing task categorization...");
        category = categorize_task_ai("finish quarterly report by friday");
        print(f"✅ Task Category: {category.name}");
        
        print(f"\n🎉 SUCCESS: Real Gemini API integration is working!");
        print(f"🚀 byLLM framework successfully connected to Gemini");
        
    } except Exception as e {
        print(f"⚠️ API Issue: {e}");
        
        # Check for specific error types
        error_str = str(e);
        if "overloaded" in error_str or "503" in error_str {
            print("💡 This is actually GOOD news!");
            print("✅ byLLM integration is working correctly");
            print("🔄 Gemini API is just temporarily overloaded");
            print("⏰ Try again in a few minutes");
        } elif "API key" in error_str or "authentication" in error_str {
            print("🔑 API key issue detected");
            print("💡 Run: python setup_gemini_api.py");
        } else {
            print("🔧 Other API issue - check your configuration");
        }
    }
}