@echo off
echo Starting Auto Git Sync in background...
echo.

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Start the sync script in background
start /B python auto_git_sync.py --interval 5 > logs/auto_sync.log 2>&1

echo Auto Git Sync started in background!
echo Check logs/auto_sync.log for activity
echo.
echo To stop, run: taskkill /F /IM python.exe
echo.
pause
