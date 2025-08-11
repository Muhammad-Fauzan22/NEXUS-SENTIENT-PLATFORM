# Auto Git Sync System

Sistem ini akan secara otomatis meng-upload setiap perubahan yang Anda buat di VSCode ke GitHub secara real-time.

## Cara Menggunakan

### 1. Setup Awal
1. Pastikan Anda sudah login ke GitHub di terminal:
   ```bash
   git config --global user.name "Nama Anda"
   git config --global user.email "email@anda.com"
   ```

2. Pastikan remote repository sudah ter-set:
   ```bash
   git remote -v
   ```
   Jika belum, tambahkan:
   ```bash
   git remote add origin https://github.com/username/repository.git
   ```

### 2. Jalankan Setup
- **Windows**: Double-click `setup_auto_sync.bat`
- **Manual**: Jalankan `python auto_git_sync.py`

### 3. Cara Kerja
- Sistem akan memantau perubahan file setiap 5 detik
- Otomatis commit dengan pesan yang informatif
- Push ke GitHub secara otomatis
- Log aktivitas tersedia di `auto_git_sync.log`

## Opsi Konfigurasi

### Jalankan dengan interval berbeda:
```bash
python auto_git_sync.py --interval 10  # Cek setiap 10 detik
```

### Jalankan untuk branch tertentu:
```bash
python auto_git_sync.py --branch develop
```

## Troubleshooting

### Jika tidak bisa push:
1. Cek token GitHub:
   ```bash
   git remote set-url origin https://<token>@github.com/username/repository.git
   ```

2. Cek permission:
   ```bash
   git push origin main --dry-run
   ```

### Stop Auto Sync:
Tekan `Ctrl+C` di terminal yang menjalankan script

## Fitur
- ✅ Auto-commit dengan pesan yang jelas
- ✅ Real-time monitoring
- ✅ Error handling
- ✅ Logging aktivitas
- ✅ Support multiple branch
- ✅ Configurable interval

## Struktur File
```
auto_git_sync.py      # Script utama
setup_auto_sync.bat   # Setup otomatis untuk Windows
README_AUTO_SYNC.md   # Dokumentasi
auto_git_sync.log     # Log aktivitas (akan dibuat otomatis)
```

## Contoh Output
```
2024-01-15 14:30:45 - INFO - Starting auto-git-sync monitoring...
2024-01-15 14:31:02 - INFO - Detected file changes...
2024-01-15 14:31:02 - INFO - Committed: Auto-sync: src/app.js, package.json - 2024-01-15 14:31:02
2024-01-15 14:31:03 - INFO - Changes pushed to GitHub
