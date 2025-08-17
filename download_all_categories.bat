@echo off
echo =====================================================
echo NEXUS Platform - Complete Dataset Download
echo =====================================================
echo.

echo [INFO] Starting complete dataset download for NEXUS Platform...
echo [INFO] This will download 100+ datasets across 4 categories
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PowerShell is not available
    pause
    exit /b 1
)

echo [INFO] Running enhanced dataset downloader...
python download_all_datasets_enhanced.py

echo.
echo =====================================================
echo Download Complete!
echo =====================================================
echo.
echo Next steps:
echo 1. Install dependencies: pip install -r requirements_datasets.txt
echo 2. Verify Kaggle API setup: kaggle datasets list
echo 3. Check dataset directories: ./datasets/
echo 4. Run data ingestion: python scripts/ingest_datasets.py
echo.
pause
