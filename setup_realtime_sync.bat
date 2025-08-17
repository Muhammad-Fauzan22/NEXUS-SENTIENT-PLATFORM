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
