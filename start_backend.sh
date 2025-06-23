#!/bin/bash

# Skin Studio Backend Starter Script
# This script starts the full-featured backend (app_local.py)

echo "🚀 Starting Skin Studio Backend (Full-Featured)"
echo "================================================"

# Check if we're in the right directory
if [ ! -d "api" ]; then
    echo "❌ Error: api directory not found. Please run this script from the adberg root directory."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "api/venv" ]; then
    echo "❌ Error: Virtual environment not found. Please run the initial setup first."
    echo "   cd api && python3 -m venv venv && source venv/bin/activate && pip install requirements"
    exit 1
fi

# Kill any existing Python processes (optional safety measure)
echo "🔄 Stopping any existing backend processes..."
pkill -f "python.*app" 2>/dev/null || true
sleep 2

# Navigate to API directory and start the server
echo "📁 Navigating to API directory..."
cd api

echo "🐍 Activating virtual environment..."
source venv/bin/activate

echo "🔥 Starting app_local.py on port 5001..."
echo ""
echo "✅ Backend will be available at: http://localhost:5001"
echo "✅ API endpoints ready for Skin Studio frontend"
echo ""
echo "📊 Features enabled:"
echo "   - B2 Cloud Storage Upload"
echo "   - Automatic Image Enhancement"
echo "   - Real-time Status Updates"
echo "   - Secure File Proxy"
echo "   - Local Storage Fallback"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo ""

# Start the full-featured backend
python app_local.py 