@echo off
echo ========================================
echo NEXUS Platform Dataset Downloader
echo ========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo Error: pip is not installed
    pause
    exit /b 1
)

:: Install required packages
echo Installing required packages...
pip install requests kaggle datasets

:: Check if Kaggle credentials exist
if not exist "%USERPROFILE%\.kaggle\kaggle.json" (
    echo.
    echo WARNING: Kaggle credentials not found!
    echo Please create kaggle.json file at: %USERPROFILE%\.kaggle\kaggle.json
    echo Visit: https://www.kaggle.com/settings/account to create API token
    echo.
    pause
)

:: Run the dataset downloader
echo Starting dataset download...
python download_all_datasets.py

echo.
echo ========================================
echo Download completed!
echo Check ./datasets/ directory for files
echo ========================================
pause
