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

echo [INFO] Running preflight checks (batch-level)...

REM Disk space check on current drive
for /f "tokens=1 delims=:" %%d in ("%CD%") do set CURDRV=%%d:
powershell -NoProfile -ExecutionPolicy Bypass -Command "$drive = (Get-Item -LiteralPath '.').PSDrive; $freeGB = [math]::Round($drive.Free/1GB,1); Write-Host ('[INFO] Free space on ' + $drive.Name + ': ' + $freeGB + ' GB'); if ($freeGB -lt 50) { Write-Host ('[WARN] Low disk space (<50 GB). Large datasets may fail.') }"

REM Kaggle credentials check (non-fatal)
if defined KAGGLE_CONFIG_DIR (
    if exist "%KAGGLE_CONFIG_DIR%\kaggle.json" (
        echo [INFO] Kaggle credentials found in KAGGLE_CONFIG_DIR
    ) else (
        echo [WARN] kaggle.json not found in KAGGLE_CONFIG_DIR
    )
) else (
    if exist "%USERPROFILE%\.kaggle\kaggle.json" (
        echo [INFO] Kaggle credentials found at %USERPROFILE%\.kaggle\kaggle.json
    ) else (
        echo [WARN] Kaggle credentials not found at %USERPROFILE%\.kaggle\kaggle.json
        echo [WARN] Kaggle datasets may fail. Create token at https://www.kaggle.com/settings/account
    )
)

echo [INFO] Installing dataset requirements...
python -m pip install -r requirements_datasets.txt
if %errorlevel% neq 0 (
    echo [WARN] Failed to install some dataset dependencies. Continuing...
)

echo [INFO] Running enhanced dataset downloader...
set DOWNLOAD_FAILED=0
powershell -NoProfile -ExecutionPolicy Bypass -Command "$out = & python 'download_all_datasets_enhanced.py' 2>&1; $code = $LASTEXITCODE; $out | Tee-Object -FilePath 'datasets_download.log'; exit $code"
if %errorlevel% neq 0 (
    echo [WARN] Some categories failed during download. See datasets_download.log
    set DOWNLOAD_FAILED=1
) else (
    echo [INFO] Download orchestrator completed successfully.
)

echo.
echo [INFO] Verifying datasets...
powershell -NoProfile -ExecutionPolicy Bypass -Command "python 'verify_datasets.py' ^| Tee-Object -FilePath 'datasets_verify.log'"
echo [INFO] Verification output saved to datasets_verify.log

if "%DOWNLOAD_FAILED%"=="1" (
    echo [SUMMARY] Download status: PARTIAL FAILURE. Review datasets_download.log and datasets_verify.log
) else (
    echo [SUMMARY] Download status: SUCCESS. Review datasets_verify.log for coverage details
)

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
