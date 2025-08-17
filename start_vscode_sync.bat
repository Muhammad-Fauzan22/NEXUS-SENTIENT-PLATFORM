@echo off
echo Starting VSCode Auto Git Sync...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python first
    pause
    exit /b 1
)

REM Check if GitHub CLI is installed
gh --version >nul 2>&1
if errorlevel 1 (
    echo ❌ GitHub CLI (gh) is not installed
    echo Please install GitHub CLI from: https://cli.github.com/
    pause
    exit /b 1
)

REM Check if authenticated
gh auth status >nul 2>&1
if errorlevel 1 (
    echo ❌ GitHub CLI not authenticated
    echo Please run: gh auth login
    pause
    exit /b 1
)

echo ✅ All requirements satisfied!
echo.
echo 🚀 Starting real-time sync...
echo 💡 Keep this window open while coding
echo 📝 Your changes will auto-sync to GitHub
echo.
echo Press Ctrl+C to stop
echo.

python auto_git_sync_vscode.py

pause
