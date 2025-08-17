# ===================================================================
# 🚀 SIMPLE REAL-TIME GITHUB SYNC
# PowerShell Edition - Clean & Simple
# ===================================================================

param(
    [string]$RepoPath = ".",
    [int]$SyncDelay = 2
)

# Setup colors
$Host.UI.RawUI.ForegroundColor = "White"
$Success = "Green"
$Info = "Cyan"
$Warning = "Yellow"
$ErrorColor = "Red"

# Logging
function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
    Add-Content -Path "sync.log" -Value "[$timestamp] $Message"
}

# Main banner
Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                🚀 REAL-TIME GITHUB SYNC                     ║
║              PowerShell Simple Edition                      ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check prerequisites
Write-Log "Checking prerequisites..." $Info

# Check Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Log "❌ Git is not installed. Please install from: https://git-scm.com" $ErrorColor
    exit 1
}

# Check GitHub CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Log "❌ GitHub CLI is not installed. Installing..." $Warning
    winget install GitHub.cli --accept-source-agreements --accept-package-agreements
}

# Check authentication
$auth = gh auth status 2>&1
if ($auth -like "*not logged in*") {
    Write-Log "🔐 Please login to GitHub CLI..." $Warning
    gh auth login
}

# Initialize git repo if needed
Set-Location $RepoPath
if (-not (Test-Path ".git")) {
    Write-Log "📁 Initializing Git repository..." $Info
    git init
    git branch -M main
    
    # Get repo URL
    $repoUrl = gh repo view --json url --jq '.url' 2>$null
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Log "✅ Repository configured: $repoUrl" $Success
    } else {
        Write-Log "❌ Could not determine repository URL" $ErrorColor
        exit 1
    }
}

# Configure VSCode
if (-not (Test-Path ".vscode")) {
    New-Item -ItemType Directory -Path ".vscode" -Force | Out-Null
}

# Simple VSCode settings
$vscodeSettings = @{
    "files.autoSave" = "afterDelay"
    "files.autoSaveDelay" = 1000
    "git.autofetch" = $true
    "git.enableSmartCommit" = $true
} | ConvertTo-Json -Depth 10

$vscodeSettings | Out-File -FilePath ".vscode/settings.json" -Encoding UTF8

# Sync function
function Sync-Now {
    $changes = git status --porcelain
    if (-not $changes) {
        return
    }
    
    Write-Log "Found changes, syncing..." $Info
    
    # Stage all changes
    git add .
    
    # Generate commit message
    $fileCount = ($changes -split "`n").Count
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    if ($fileCount -eq 1) {
        $file = $changes.Substring(3)
        $action = switch ($changes.Substring(0, 2).Trim()) {
            "A" { "Add" }
            "M" { "Update" }
            "D" { "Delete" }
            "??" { "Add" }
            default { "Modify" }
        }
        $message = "📝 $action: $file - $timestamp"
    } else {
        $message = "🔄 Sync: $fileCount files - $timestamp"
    }
    
    # Commit and push
    git commit -m $message
    git push origin main
    
    Write-Log "✅ $message" $Success
}

# Initial sync
Write-Log "Performing initial sync..." $Info
Sync-Now

# Start monitoring
Write-Log "🚀 Starting real-time monitoring..." $Info
Write-Log "📁 Directory: $(Get-Location)" $Info
Write-Log "⏱️  Sync delay: ${SyncDelay}s" $Info
Write-Log "🛑 Press Ctrl+C to stop" $Warning

# Simple polling loop
while ($true) {
    Sync-Now
    Start-Sleep -Seconds $SyncDelay
}
