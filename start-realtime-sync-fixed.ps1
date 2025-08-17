# ===================================================================
# 🚀 QUICK START REAL-TIME GITHUB SYNC
# One-click setup and run - Fixed Version
# ===================================================================

param(
    [switch]$Setup,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                🚀 NEXUS REAL-TIME SYNC                      ║
║          Upload Progress Code ke GitHub Otomatis           ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Magenta

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Running without admin privileges. Some features may be limited." -ForegroundColor Yellow
}

# Main execution
try {
    if ($Setup) {
        Write-Host "`n🔧 Setup mode: Mengonfigurasi environment..." -ForegroundColor Cyan
        
        # Install GitHub CLI jika belum ada
        if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
            Write-Host "📦 Installing GitHub CLI..." -ForegroundColor Yellow
            winget install GitHub.cli --accept-source-agreements --accept-package-agreements
        }
        
        # Install Git jika belum ada
        if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
            Write-Host "📦 Installing Git..." -ForegroundColor Yellow
            winget install Git.Git --accept-source-agreements --accept-package-agreements
        }
        
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    }
    
    # Check file exists
    if (-not (Test-Path "realtime-github-sync.ps1")) {
        Write-Host "❌ File realtime-github-sync.ps1 tidak ditemukan!" -ForegroundColor Red
        exit 1
    }
    
    # Check execution policy
    $policy = Get-ExecutionPolicy
    if ($policy -eq "Restricted") {
        Write-Host "⚠️  Execution policy is restricted. Setting to RemoteSigned..." -ForegroundColor Yellow
        Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    }
    
    # Start sync
    Write-Host "`n🚀 Memulai realtime sync..." -ForegroundColor Green
    Write-Host "📁 Directory: $(Get-Location)" -ForegroundColor Cyan
    Write-Host "⏱️  Sync delay: 2 detik" -ForegroundColor Cyan
    Write-Host "🛑 Tekan Ctrl+C untuk berhenti" -ForegroundColor Yellow
    
    # Run the main sync script
    & ".\realtime-github-sync.ps1" -RepoPath "." -SyncDelay 2
    
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    Write-Host "💡 Tips: Pastikan:" -ForegroundColor Yellow
    Write-Host "   • GitHub CLI terinstall: winget install GitHub.cli"
    Write-Host "   • Git terinstall: winget install Git.Git"
    Write-Host "   • Jalankan: gh auth login"
    Write-Host "   • Jalankan script dengan: .\start-realtime-sync.ps1"
    
    # Offer to open browser for setup
    $response = Read-Host "`nBuka browser untuk setup GitHub token? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Start-Process "https://github.com/settings/tokens"
    }
}

Write-Host "`n✨ Script selesai!" -ForegroundColor Green
