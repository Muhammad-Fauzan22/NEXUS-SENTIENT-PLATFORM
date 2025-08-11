@echo off
echo Setting up GitHub authentication...
echo.

REM Check if gh CLI is installed
gh --version >nul 2>&1
if errorlevel 1 (
    echo GitHub CLI (gh) not found.
    echo Installing GitHub CLI...
    echo Please download from: https://cli.github.com/
    echo After installation, run this script again.
    pause
    exit /b 1
)

REM Login to GitHub
echo Logging in to GitHub...
gh auth login

REM Set remote URL with authentication
echo Setting up remote repository...
