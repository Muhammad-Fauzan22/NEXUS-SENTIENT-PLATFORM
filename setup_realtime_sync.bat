@echo off
REM Setup Complete Real-time GitHub Sync System
REM One-click setup for ultra-fast realtime sync

title Setup Real-time GitHub Sync

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                REALTIME GITHUB SYNC SETUP                    ║
echo ║                    Ultra-fast Auto-Sync                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check prerequisites
echo 🔍 Checking prerequisites...

REM Check Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git not found! Please install Git first.
    pause
    exit /b 1
)

REM Check GitHub CLI
gh --version >nul 2>&1
if errorlevel 1 (
    echo ❌ GitHub CLI not found! Please install GitHub CLI.
    echo Download from: https://cli.github.com/
    pause
    exit /b 1
)

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.x
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
pip install watchdog

REM Check if git repository
if not exist ".git" (
    echo ❌ Not a git repository!
    echo Please run: git init
    pause
    exit /b 1
)

REM Check GitHub authentication
echo 🔐 Checking GitHub authentication...
gh auth status >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please login to GitHub CLI...
    gh auth login
)

REM Test push
echo 🧪 Testing GitHub connection...
git push >nul 2>&1
if errorlevel 1 (
    echo ❌ Cannot push to GitHub!
    echo Please check your remote configuration
    pause
    exit /b 1
)

echo.
echo ✅ Setup complete! Your system is ready for realtime sync.
echo.
echo 🚀 To start realtime sync:
echo    Double-click: start_realtime_sync.bat
echo.
echo 📊 To check status:
echo    Run: python realtime_git_sync_enhanced.py --status
echo.
echo 📝 Log file: realtime_sync.log
echo.

pause
