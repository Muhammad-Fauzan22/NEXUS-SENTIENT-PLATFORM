@echo off
REM Enhanced Real-time Git Sync Launcher
REM Ultra-fast realtime sync to GitHub

echo Starting REALTIME GitHub sync...
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.x
    pause
    exit /b 1
)

REM Check if watchdog is installed
python -c "import watchdog" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing watchdog...
    pip install watchdog
)

REM Start realtime sync
echo 🚀 Starting enhanced realtime sync...
echo 📁 Repository: %CD%
echo 🌐 Monitoring for changes...
echo.
echo Press Ctrl+C to stop
echo.

python realtime_git_sync_enhanced.py --repo . --remote origin --branch main

pause
