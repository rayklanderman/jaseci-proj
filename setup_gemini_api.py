#!/usr/bin/env python3
"""
Gemini API Setup Assistant for Jac AI Task Manager
Helps configure the environment for real AI integration
"""

import os
import sys
import subprocess
from pathlib import Path

def check_requirements():
    """Check if required packages are installed"""
    try:
        import byllm
        print("✅ byllm package is installed")
        return True
    except ImportError:
        print("❌ byllm package not found")
        return False

def install_byllm():
    """Install byllm package"""
    print("📦 Installing byllm...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "byllm"])
        print("✅ byllm installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install byllm")
        return False

def check_api_key():
    """Check if Gemini API key is set"""
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        print(f"✅ GEMINI_API_KEY is set: {api_key[:8]}...")
        return True
    else:
        print("❌ GEMINI_API_KEY not found in environment")
        return False

def setup_api_key():
    """Interactive API key setup"""
    print("\n🔑 Gemini API Key Setup")
    print("=" * 40)
    print("1. Go to: https://aistudio.google.com/app/apikey")
    print("2. Create a new API key")
    print("3. Copy the key")
    print()
    
    api_key = input("Paste your Gemini API key here (or press Enter to skip): ").strip()
    
    if not api_key:
        print("⏭️  Skipping API key setup")
        return False
    
    # Set for current session
    os.environ["GEMINI_API_KEY"] = api_key
    print("✅ API key set for current session")
    
    # Generate PowerShell commands for permanent setup
    print("\n💡 To make this permanent, run these commands in PowerShell:")
    print(f'$env:GEMINI_API_KEY="{api_key}"')
    print('setx GEMINI_API_KEY "$env:GEMINI_API_KEY"')
    
    return True

def test_api_connection():
    """Test API connection with a simple call"""
    print("\n🧪 Testing API connection...")
    try:
        # Import here to avoid issues if not installed
        from byllm import Model
        
        # Create model instance
        model = Model(model_name="gemini/gemini-2.0-flash")
        
        # Simple test call
        result = model.generate("Say 'Hello from Gemini AI!'")
        print(f"✅ API test successful: {result}")
        return True
        
    except Exception as e:
        print(f"❌ API test failed: {e}")
        print("💡 This might be due to:")
        print("   • Invalid API key")
        print("   • Network issues")
        print("   • Model overload (try again later)")
        return False

def create_env_file():
    """Create .env file for environment variables"""
    env_path = Path(".env")
    api_key = os.getenv("GEMINI_API_KEY")
    
    if api_key:
        with open(env_path, "w") as f:
            f.write(f"GEMINI_API_KEY={api_key}\n")
        print(f"✅ Created .env file at {env_path.absolute()}")
        return True
    
    return False

def main():
    """Main setup process"""
    print("🚀 Gemini API Setup Assistant")
    print("=" * 50)
    
    # Step 1: Check and install byllm
    if not check_requirements():
        if not install_byllm():
            print("❌ Setup failed: Could not install byllm")
            return False
    
    # Step 2: Check API key
    if not check_api_key():
        if not setup_api_key():
            print("⚠️  Setup completed but API key not configured")
            print("💡 You can set it later with:")
            print("   $env:GEMINI_API_KEY=\"your_api_key_here\"")
            return False
    
    # Step 3: Create .env file
    create_env_file()
    
    # Step 4: Test connection (optional)
    test_choice = input("\n🔍 Test API connection now? (y/N): ").lower().strip()
    if test_choice == 'y':
        test_api_connection()
    
    print("\n🎉 Setup Complete!")
    print("🚀 You can now run: jac run ai_task_manager_gemini.jac")
    print("📚 For more info, see: AI_SETUP_GUIDE.md")
    
    return True

if __name__ == "__main__":
    main()