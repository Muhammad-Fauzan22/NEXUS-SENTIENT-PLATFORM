@echo off
echo ========================================
echo 🚀 NEXUS AUTO-SYNC SETUP
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python tidak terinstall. Install Python terlebih dahulu.
    pause
    exit /b 1
)

REM Check Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git tidak terinstall. Install Git terlebih dahulu.
    pause
    exit /b 1
)

REM Check GitHub CLI
gh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ GitHub CLI tidak terinstall. Install GitHub CLI terlebih dahulu.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
pip install watchdog >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Gagal install watchdog
    pause
    exit /b 1
)

REM Check GitHub auth
echo 🔐 Checking GitHub authentication...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ GitHub CLI belum login. Jalankan: gh auth login
    pause
    exit /b 1
)

REM Check git repository
if not exist ".git" (
    echo ❌ Bukan git repository. Jalankan: git init
    pause
    exit /b 1
)

echo ✅ Semua requirements terpenuhi!
echo.
echo 🎯 Pilihan:
echo 1. Jalankan Auto-Sync (Realtime)
echo 2. Jalankan Auto-Sync (Basic)
echo 3. Check Status
echo 4. Exit

choice /C 1234 /N /M "Pilih opsi: "

if %errorlevel%==1 (
    echo 🔄 Menjalankan auto-sync realtime...
    python auto_git_sync_vscode.py
)

if %errorlevel%==2 (
    echo 🔄 Menjalankan auto-sync basic...
    python auto_git_sync.py
)

if %errorlevel%==3 (
    echo 📊 Checking status...
    python auto_git_sync_vscode.py --status
    pause
)

if %errorlevel%==4 (
    echo 👋 Bye!
    exit /b 0
)
