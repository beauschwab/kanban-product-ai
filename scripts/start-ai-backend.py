#!/usr/bin/env python3
"""
Startup script for the AI Agents Backend
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_requirements():
    """Check if required packages are installed"""
    try:
        import fastapi
        import uvicorn
        import websockets
        import google.generativeai
        import pydantic
        logger.info("All required packages are installed")
        return True
    except ImportError as e:
        logger.error(f"Missing required package: {e}")
        return False

def install_requirements():
    """Install required packages"""
    logger.info("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        logger.info("Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install requirements: {e}")
        return False

def setup_environment():
    """Setup environment variables"""
    if not os.getenv("GOOGLE_AI_API_KEY"):
        logger.warning("GOOGLE_AI_API_KEY not set. Please set your Google AI API key.")
        logger.info("You can get an API key from: https://makersuite.google.com/app/apikey")
        
        # Prompt user for API key
        api_key = input("Enter your Google AI API key (or press Enter to continue with demo mode): ").strip()
        if api_key:
            os.environ["GOOGLE_AI_API_KEY"] = api_key
            logger.info("API key set successfully")
        else:
            logger.warning("Running in demo mode without actual AI capabilities")
            os.environ["GOOGLE_AI_API_KEY"] = "demo-key"

def main():
    """Main startup function"""
    logger.info("Starting AI Agents Backend...")
    
    # Check and install requirements
    if not check_requirements():
        if not install_requirements():
            logger.error("Failed to install requirements. Exiting.")
            sys.exit(1)
    
    # Setup environment
    setup_environment()
    
    # Start the server
    logger.info("Starting FastAPI server on http://localhost:8000")
    logger.info("WebSocket endpoint: ws://localhost:8000/ws")
    logger.info("API documentation: http://localhost:8000/docs")
    
    try:
        # Import and run the server
        from ai_agents_backend import app
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
