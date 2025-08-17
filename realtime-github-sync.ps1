# ===================================================================
# 🚀 REAL-TIME GITHUB SYNC FOR NEXUS-SENTIENT-PLATFORM
# PowerShell Edition with Enterprise Features
# ===================================================================

param(
    [string]$RepoPath = ".",
    [string]$Remote = "origin",
    [string]$Branch = "main",
    [int]$SyncDelay = 2,
    [switch]$SetupOnly,
    [switch]$Force
)

# Force UTF-8 output to avoid encoding issues with special characters
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [Console]::OutputEncoding

# Color codes for better UX
$Colors = @{
    Success = "Green"
    Info = "Cyan"
    Warning = "Yellow"
    Error = "Red"
    Highlight = "Magenta"
}

# Logging function
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "SUCCESS" { $Colors.Success }
        "INFO" { $Colors.Info }
        "WARNING" { $Colors.Warning }
        "ERROR" { $Colors.Error }
        default { "White" }
    }
    
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
    Add-Content -Path "realtime_sync.log" -Value "[$timestamp] [$Level] $Message"
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..." "INFO"
    
    # Check Git
    try {
        $gitVersion = git --version 2>$null
        if ($gitVersion) {
            Write-Log "✅ Git found: $gitVersion" "SUCCESS"
        } else {
            throw "Git not found"
        }
    } catch {
        Write-Log "❌ Git is not installed. Please install from: https://git-scm.com" "ERROR"
        return $false
    }
    
    # Check GitHub CLI
    try {
        $ghVersion = gh --version 2>$null
        if ($ghVersion) {
            Write-Log "✅ GitHub CLI found: $ghVersion" "SUCCESS"
        } else {
            Write-Log "⚠️  GitHub CLI not found. Installing..." "WARNING"
            winget install GitHub.cli
            Write-Log "✅ GitHub CLI installed" "SUCCESS"
        }
    } catch {
        Write-Log "❌ Failed to install GitHub CLI. Please install manually." "ERROR"
        return $false
    }
    
    return $true
}

# Setup GitHub authentication
function Setup-GitHubAuth {
    Write-Log "Setting up GitHub authentication..." "INFO"
    
    # Check if GitHub CLI is authenticated
    $authStatus = gh auth status 2>&1
    if ($authStatus -like "*Logged in*") {
        Write-Log "✅ Already authenticated with GitHub CLI" "SUCCESS"
        return $true
    }
    
    # Try to authenticate
    Write-Log "🔐 Please authenticate with GitHub CLI..." "INFO"
    gh auth login
    
    # Verify authentication
    $authStatus = gh auth status 2>&1
    if ($authStatus -like "*Logged in*") {
        Write-Log "✅ Successfully authenticated with GitHub" "SUCCESS"
        return $true
    } else {
        Write-Log "❌ GitHub authentication failed" "ERROR"
        return $false
    }
}

# Initialize git repository
function Initialize-GitRepo {
    param([string]$Path)
    
    Set-Location $Path
    
    if (-not (Test-Path ".git")) {
        Write-Log "📁 Initializing Git repository..." "INFO"
        git init
        git branch -M $Branch
        
        # Setup remote
        $repoUrl = gh repo view --json url --jq '.url' 2>$null
        if ($repoUrl) {
            git remote add origin $repoUrl
            Write-Log "✅ Remote configured: $repoUrl" "SUCCESS"
        } else {
            Write-Log "❌ Could not determine repository URL" "ERROR"
            return $false
        }
    } else {
        Write-Log "✅ Git repository already exists" "SUCCESS"
    }
    
    return $true
}

# Configure VSCode workspace
function Configure-VSCode {
    Write-Log "Configuring VSCode workspace..." "INFO"
    
    $vscodeDir = ".vscode"
    if (-not (Test-Path $vscodeDir)) {
        New-Item -ItemType Directory -Path $vscodeDir -Force | Out-Null
    }
    
    # VSCode settings for optimal sync
    $settings = @{
        "files.autoSave" = "afterDelay"
        "files.autoSaveDelay" = 1000
        "git.autofetch" = $true
        "git.enableSmartCommit" = $true
        "git.postCommitCommand" = "push"
        "git.confirmSync" = $false
        "workbench.colorCustomizations" = @{
            "statusBar.background" = "#007acc"
            "statusBar.noFolderBackground" = "#68217a"
        }
    }
    
    $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath "$vscodeDir/settings.json" -Encoding UTF8
    
    # VSCode tasks
    $tasks = @{
        version = "2.0.0"
        tasks = @(
            @{
                label = "Start Real-time Git Sync"
                type = "shell"
                command = "powershell"
                args = @("-ExecutionPolicy", "Bypass", "-File", "realtime-github-sync.ps1")
                group = "build"
                presentation = @{
                    echo = $true
                    reveal = "always"
                    focus = $false
                    panel = "shared"
                }
            }
        )
    }
    
    $tasks | ConvertTo-Json -Depth 10 | Out-File -FilePath "$vscodeDir/tasks.json" -Encoding UTF8
    
    Write-Log "✅ VSCode workspace configured" "SUCCESS"
}

# Smart commit message generator
function Get-CommitMessage {
    param([array]$ChangedFiles)
    
    if ($ChangedFiles.Count -eq 0) {
        return "sync: no changes - $(Get-Date -Format 'HH:mm:ss')"
    }
    
    if ($ChangedFiles.Count -eq 1) {
        $file = $ChangedFiles[0]
        $action = switch -regex ($file.Status) {
            "A|AM" { "Add" }
            "M|MM" { "Update" }
            "D" { "Delete" }
            "\?\?" { "Add" }
            default { "Modify" }
        }
        return "commit: $action $($file.Path) - $(Get-Date -Format 'HH:mm:ss')"
    }
    
    # Multiple files - group by extension
    $extensions = $ChangedFiles | Group-Object { [System.IO.Path]::GetExtension($_.Path) }
    $summary = ($extensions | ForEach-Object { "$($_.Count) $($_.Name)" }) -join ", "
    
    return "sync: $summary - $(Get-Date -Format 'HH:mm:ss')"
}

# Sync changes to GitHub
function Sync-Changes {
    Write-Log "Checking for changes..." "INFO"
    
    # Get changed files
    $changedFiles = git status --porcelain | ForEach-Object {
        $status = $_.Substring(0, 2)
        $path = $_.Substring(3)
        [PSCustomObject]@{
            Status = $status
            Path = $path
        }
    }
    
    if ($changedFiles.Count -eq 0) {
        Write-Log "No changes detected" "INFO"
        return $true
    }
    
    Write-Log "Found $($changedFiles.Count) changed file(s)" "INFO"
    
    # Stage changes
    foreach ($file in $changedFiles) {
        if ($file.Status -match "\?\?|A|M") {
            git add $file.Path
        }
    }
    
    # Check if there are changes to commit
    $status = git status --porcelain
    if (-not $status) {
        return $true
    }
    
    # Commit with smart message
    $commitMessage = Get-CommitMessage -ChangedFiles $changedFiles
    git commit -m $commitMessage
    
    # Push to GitHub
    try {
        git push origin $Branch
        Write-Log "✅ Synced: $commitMessage" "SUCCESS"
        return $true
    } catch {
        Write-Log "❌ Push failed: $_" "ERROR"
        return $false
    }
}

# File system watcher
function Start-FileWatcher {
    Write-Log "🚀 Starting real-time file monitoring..." "INFO"
    
    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = $RepoPath
    $watcher.IncludeSubdirectories = $true
    $watcher.EnableRaisingEvents = $true
    
    # Ignore patterns
    $ignorePatterns = @(
        ".git", "__pycache__", ".pyc", ".pyo", ".pyd",
        ".env", ".venv", "venv", "node_modules", ".next",
        "dist", "build", ".DS_Store", "*.log", "*.tmp",
        "*.temp", "*.cache", ".vscode/settings.json"
    )
    
    $lastSync = Get-Date
    
    Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action {
        $global:lastSync = Get-Date
    }
    
    Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action {
        $global:lastSync = Get-Date
    }
    
    Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action {
        $global:lastSync = Get-Date
    }
    
    Register-ObjectEvent -InputObject $watcher -EventName "Renamed" -Action {
        $global:lastSync = Get-Date
    }
    
    # Main sync loop
    while ($true) {
        $now = Get-Date
        if (($now - $lastSync).TotalSeconds -ge $SyncDelay) {
            Sync-Changes
            $lastSync = $now
        }
        Start-Sleep -Milliseconds 500
    }
}

# Main execution
function Main {
    Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                🚀 REAL-TIME GITHUB SYNC                     ║
║              PowerShell Ultimate Edition                    ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor $Colors.Highlight
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    # Setup GitHub auth
    if (-not (Setup-GitHubAuth)) {
        exit 1
    }
    
    # Initialize repository
    if (-not (Initialize-GitRepo -Path $RepoPath)) {
        exit 1
    }
    
    # Configure VSCode
    Configure-VSCode
    
    # Initial sync
    Write-Log "Performing initial sync..." "INFO"
    Sync-Changes
    
    if ($SetupOnly) {
        Write-Log "✅ Setup complete! Run without -SetupOnly to start sync" "SUCCESS"
        return
    }
    
    # Start monitoring
    Start-FileWatcher
}

# Error handling
trap {
    Write-Log "💥 Fatal error: $_" "ERROR"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" "ERROR"
    exit 1
}

# Execute main function
Main
