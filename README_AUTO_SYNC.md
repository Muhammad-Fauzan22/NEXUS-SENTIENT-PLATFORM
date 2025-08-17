# VSCode Auto Git Sync - Real-time GitHub Upload

Sistem ini memungkinkan VSCode untuk secara otomatis mengupload perubahan code ke GitHub secara realtime.

## 🚀 Cara Menggunakan

### 1. Setup Awal

Pastikan Anda sudah memiliki:

- Python 3.x terinstall
- GitHub CLI (gh) terinstall
- Repository sudah di-push ke GitHub

### 2. Install Dependencies

```bash
pip install watchdog
```

### 3. Login ke GitHub CLI

```bash
gh auth login
```

### 4. Jalankan Auto-Sync

Double-click file `start_vscode_sync.bat` atau jalankan dari terminal:

```bash
python auto_git_sync_vscode.py
```

## ⚙️ Konfigurasi VSCode

Sistem ini akan otomatis mengatur VSCode settings untuk:

- Auto-save file setiap 1 detik
- Disable Git sync confirmation
- Enable smart commit

## 📁 File yang Dibuat

- `auto_git_sync_vscode.py` - Script utama auto-sync
- `start_vscode_sync.bat` - Launcher untuk Windows
- `.vscode/settings.json` - VSCode configuration

## 🔄 Cara Kerja

1. **File Watcher**: Menggunakan watchdog untuk memantau perubahan file
2. **Auto Commit**: Otomatis commit perubahan dengan pesan yang deskriptif
3. **Real-time Push**: Push ke GitHub setiap ada perubahan
4. **Smart Filtering**: Tidak sync file yang tidak perlu (node_modules, .env, dll)

## 🛠️ Customization

### Ganti Branch

```bash
python auto_git_sync_vscode.py --branch develop
```

### Ganti Remote

```bash
python auto_git_sync_vscode.py --remote upstream
```

### Status Check

```bash
python auto_git_sync_vscode.py --status
```

## 🚨 Troubleshooting

### Error: "Not a git repository"

```bash
git init
git remote add origin https://github.com/username/repo.git
```

### Error: "Remote not found"

```bash
git remote add origin https://github.com/username/repo.git
```

### Error: "GitHub CLI not authenticated"

```bash
gh auth login
```

## 💡 Tips

1. **Keep the terminal window open** - Auto-sync berjalan di background
2. **Gunakan branch terpisah** untuk development aktif
3. **Commit message otomatis** mencantumkan file yang berubah
4. **File besar** akan tetap sync, tapi pertimbangkan .gitignore

## 🔧 Manual Setup (Alternative)

Jika ingin setup manual tanpa script:

1. Install extension VSCode: **GitHub Repositories**
2. Enable auto-save: File → Auto Save
3. Install GitHub CLI dan login
4. Gunakan terminal untuk push otomatis

## 📊 Monitoring

Cek log file `auto_git_sync.log` untuk melihat aktivitas sync:

```bash
tail -f auto_git_sync.log
```

## 🛑 Stop Auto-Sync

Tekan `Ctrl+C` di terminal yang menjalankan auto-sync, atau tutup terminal window.
