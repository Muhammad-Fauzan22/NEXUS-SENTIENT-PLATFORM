@echo off
echo =================================================
echo 🚀 ULTIMATE REAL-TIME GITHUB SYNC FOR VSCode
echo =================================================
echo.

:: Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from: https://python.org
    pause
    exit /b 1
)

:: Check if sync_config.json exists
if not exist "sync_config.json" (
    echo Creating sync_config.json...
    echo {
    echo   "github_token": "YOUR_GITHUB_TOKEN_HERE",
    echo   "repo_owner": "Muhammad-Fauzan22",
    echo   "repo_name": "NEXUS-SENTIENT-PLATFORM",
    echo   "sync_delay": 2,
    echo   "ignore_patterns": [
    echo     ".git", "__pycache__", ".pyc", ".pyo", ".pyd",
    echo     ".env", ".venv", "venv", "node_modules", ".next",
    echo     "dist", "build", ".DS_Store", "*.log", "*.tmp"
    echo   ]
    echo } > sync_config.json
    echo.
    echo ⚠️  Please edit sync_config.json and add your GitHub token
    echo Get token from: https://github.com/settings/tokens
    pause
    exit /b 1
)

:: Check GitHub token
findstr /C:"YOUR_GITHUB_TOKEN_HERE" sync_config.json >nul
if not errorlevel 1 (
    echo ❌ Please replace YOUR_GITHUB_TOKEN_HERE in sync_config.json
    echo Get token from: https://github.com/settings/tokens
    pause
    exit /b 1
)

:: Check Git installation
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed
    echo Please install Git from: https://git-scm.com
    pause
    exit /b 1
)

:: Check if current directory is git repo
if not exist ".git" (
    echo ⚠️  Initializing Git repository...
    git init
    git branch -M main
    echo ✅ Git repository initialized
)

:: Check if remote exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Setting up GitHub remote...
    git remote add origin https://github.com/Muhammad-Fauzan22/NEXUS-SENTIENT-PLATFORM.git
    echo ✅ GitHub remote configured
)

:: Install dependencies
echo 📦 Checking dependencies...
python -c "import watchdog" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install watchdog requests psutil
)

:: Configure VSCode workspace
echo 🔧 Configuring VSCode workspace...
if not exist ".vscode" mkdir .vscode
python -c "
import json
import os
from pathlib import Path

# Create minimal config
config = {
    'github_token': os.getenv('GITHUB_TOKEN', 'YOUR_GITHUB_TOKEN_HERE'),
    'repo_owner': 'Muhammad-Fauzan22',
    'repo_name': 'NEXUS-SENTIENT-PLATFORM',
    'sync_delay': 2
}

with open('sync_config.json', 'w') as f:
    json.dump(config, f, indent=2)

print('✅ Quick setup complete!')
print('Next: Edit sync_config.json with your GitHub token')
print('Then run: start_ultimate_sync.bat')
"

echo.
echo Setup complete! Run start_ultimate_sync.bat to begin
pause
