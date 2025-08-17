# 🚀 Real-Time GitHub Sync - PowerShell Edition

Upload progress code secara otomatis ke GitHub menggunakan PowerShell dengan fitur enterprise-grade.

## ⚡ Quick Start

### 1. One-Click Setup
```powershell
# Jalankan langsung (setup + sync)
.\start-realtime-sync.ps1

# Atau setup terlebih dahulu
.\start-realtime-sync.ps1 -Setup
```

### 2. Manual Setup
```powershell
# Install dependencies
winget install GitHub.cli
winget install Git.Git

# Login ke GitHub
gh auth login

# Jalankan sync
.\realtime-github-sync.ps1
```

## 🎯 Fitur Utama

### ✅ Auto-Setup
- **GitHub CLI**: Install otomatis jika belum ada
- **Git**: Install dan konfigurasi otomatis
- **VSCode Integration**: Auto-configure workspace settings
- **Token Management**: Setup GitHub token otomatis

### 🔄 Real-Time Sync
- **FileSystemWatcher**: Monitor perubahan file secara real-time
- **Smart Commit**: Generate commit message otomatis
- **Instant Push**: Push ke GitHub dalam 2 detik setelah perubahan
- **Ignore Patterns**: Filter file yang tidak perlu di-sync

### 🎨 Smart Features
- **Commit Messages**: 
  - Single file: `📝 Update: filename.js - 14:30:25`
  - Multiple files: `🔄 Sync: 3 .js, 2 .css - 14:30:25`
- **Error Handling**: Retry mechanism dan logging lengkap
- **VSCode Integration**: Auto-save dan git features

## 📁 File Structure

```
NEXUS-SENTIENT-PLATFORM/
├── realtime-github-sync.ps1    # Script utama
├── start-realtime-sync.ps1     # Quick start wrapper
├── sync_config.json           # Konfigurasi
├── .vscode/
│   ├── settings.json          # VSCode settings
│   └── tasks.json            # VSCode tasks
└── realtime_sync.log         # Log file
```

## ⚙️ Konfigurasi

### sync_config.json
```json
{
  "github_token": "ghp_xxxxxxxxxxxxxxxxxxxx",
  "repo_owner": "Muhammad-Fauzan22",
  "repo_name": "NEXUS-SENTIENT-PLATFORM",
  "sync_delay": 2,
  "ignore_patterns": [
    ".git", "__pycache__", ".pyc", ".env", "node_modules"
  ]
}
```

### Environment Variables
```powershell
# Set GitHub token via environment
$env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxx"
```

## 🚀 Usage Patterns

### 1. Development Mode
```powershell
# Start sync untuk development
.\realtime-github-sync.ps1 -RepoPath "C:\Projects\NEXUS" -SyncDelay 1
```

### 2. CI/CD Mode
```powershell
# Setup only untuk CI/CD
.\realtime-github-sync.ps1 -SetupOnly
```

### 3. Force Mode
```powershell
# Force re-setup semua konfigurasi
.\start-realtime-sync.ps1 -Force
```

## 🔧 Troubleshooting

### GitHub CLI belum terinstall
```powershell
# Install via winget
winget install GitHub.cli

# Atau via chocolatey
choco install gh
```

### Permission denied
```powershell
# Jalankan sebagai Administrator
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File .\start-realtime-sync.ps1" -Verb RunAs
```

### Token expired
```powershell
# Generate new token
Start-Process "https://github.com/settings/tokens"

# Update token
gh auth refresh
```

## 📊 Monitoring

### Real-time logs
```powershell
# Tail logs
Get-Content realtime_sync.log -Wait

# Filter by error
Select-String "ERROR" realtime_sync.log
```

### VSCode Status Bar
- **Blue**: Sync active
- **Purple**: Setup mode
- **Red**: Error state

## 🛡️ Security

- **Token encryption**: GitHub CLI menyimpan token secara encrypted
- **No plain text**: Token tidak disimpan dalam script
- **Scope minimal**: Hanya `repo` scope yang dibutuhkan
- **Auto-expire**: Token bisa di-revoke kapan saja

## 🎮 VSCode Integration

### Tasks
- `Ctrl+Shift+P` → `Tasks: Run Task` → `Start Real-time Git Sync`

### Settings
- Auto-save: ON (1 detik delay)
- Auto-fetch: ON
- Smart commit: ON
- Auto-push: ON

## 📞 Support

### Quick Commands
```powershell
# Check status
gh repo view

# Check auth
gh auth status

# Check sync
git status
```

### Debug Mode
```powershell
# Enable verbose logging
$env:DEBUG = "true"
.\realtime-github-sync.ps1
```

## 🔄 Update Script

```powershell
# Update ke versi terbaru
git pull origin main
```

## 🎉 Success Indicators

✅ **Setup berhasil**:
- GitHub CLI authenticated
- Git repository initialized
- VSCode workspace configured
- Real-time sync running

✅ **Sync berhasil**:
- Commit messages muncul di GitHub
- Push otomatis setiap perubahan
- No error di logs
- VSCode status bar hijau
