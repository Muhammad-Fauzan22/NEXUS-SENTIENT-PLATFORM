# ===================================================================
# REAL-TIME GITHUB SYNC - CLEAN VERSION
# Simple PowerShell script for automatic GitHub sync
# ===================================================================

param(
    [string]$RepoPath = ".",
    [int]$SyncDelay = 2
)

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        default { "White" }
    }
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
    Add-Content -Path "sync.log" -Value "[$timestamp] [$Level] $Message"
}

# Main banner
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    REAL-TIME GITHUB SYNC STARTED       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check prerequisites
Write-Log "Checking prerequisites..."

# Check Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Log "Git is not installed. Please install from: https://git-scm.com" "ERROR"
    exit 1
}

# Check GitHub CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Log "GitHub CLI is not installed. Installing..." "WARNING"
    try {
        winget install GitHub.cli --accept-source-agreements --accept-package-agreements
        Write-Log "GitHub CLI installed successfully" "SUCCESS"
    } catch {
        Write-Log "Failed to install GitHub CLI. Please install manually." "ERROR"
        exit 1
    }
}

# Check authentication
$authCheck = gh auth status 2>&1
if ($authCheck -like "*not logged in*") {
    Write-Log "Please login to GitHub CLI..." "WARNING"
    gh auth login
}

# Initialize git repo if needed
Set-Location $RepoPath
if (-not (Test-Path ".git")) {
    Write-Log "Initializing Git repository..." "INFO"
    git init
    git branch -M main
    
    # Get repo URL
    $repoUrl = gh repo view --json url --jq '.url' 2>$null
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Log "Repository configured: $repoUrl" "SUCCESS"
    } else {
        Write-Log "Could not determine repository URL. Please run: gh repo create" "ERROR"
        exit 1
    }
}

# Configure VSCode
if (-not (Test-Path ".vscode")) {
    New-Item -ItemType Directory -Path ".vscode" -Force | Out-Null
}

$vscodeSettings = @{
    "files.autoSave" = "afterDelay"
    "files.autoSaveDelay" = 1000
    "git.autofetch" = $true
    "git.enableSmartCommit" = $true
} | ConvertTo-Json -Depth 10

$vscodeSettings | Out-File -FilePath ".vscode/settings.json" -Encoding UTF8
Write-Log "VSCode workspace configured" "SUCCESS"

# Sync function
function Sync-Now {
    $changes = git status --porcelain
    if (-not $changes) {
        return
    }
    
    $fileCount = ($changes -split "`n" | Where-Object { $_ -ne "" }).Count
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    Write-Log "Found $fileCount changed file(s), syncing..." "INFO"
    
    # Stage all changes
    git add .
    
    # Generate commit message
    if ($fileCount -eq 1) {
        $file = $changes.Substring(3)
        $status = $changes.Substring(0, 2).Trim()
        $action = switch ($status) {
            "A" { "Add" }
            "M" { "Update" }
            "D" { "Delete" }
            "??" { "Add" }
            default { "Modify" }
        }
        $message = "$action: $file at $timestamp"
    } else {
        $message = "Sync: $fileCount files at $timestamp"
    }
    
    # Commit and push
    git commit -m $message
    git push origin main
    
    Write-Log "Synced: $message" "SUCCESS"
}

# Initial sync
Write-Log "Performing initial sync..." "INFO"
Sync-Now

# Start monitoring
Write-Log "Starting real-time monitoring..." "INFO"
Write-Log "Directory: $(Get-Location)" "INFO"
Write-Log "Sync delay: ${SyncDelay}s" "INFO"
Write-Log "Press Ctrl+C to stop" "WARNING"

# Main sync loop
while ($true) {
    try {
        Sync-Now
    } catch {
        Write-Log "Sync error: $_" "ERROR"
    }
    Start-Sleep -Seconds $SyncDelay
}
