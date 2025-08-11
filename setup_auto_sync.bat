@echo off
echo Setting up Auto Git Sync...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python first
    pause
    exit /b 1
)

REM Install required packages
echo Installing required packages...
pip install watchdog

REM Create startup script
echo Creating startup script...
echo @echo off > start_auto_sync.bat
echo echo Starting Auto Git Sync... >> start_auto_sync.bat
echo python auto_git_sync.py --interval 5 >> start_auto_sync.bat
echo pause >> start_auto_sync.bat

echo.
echo Setup complete!
echo.
echo To start auto-sync, run: start_auto_sync.bat
echo.
pause
