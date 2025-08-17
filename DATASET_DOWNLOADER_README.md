# NEXUS Platform Dataset Downloader

Panduan resmi untuk mengunduh dataset NEXUS secara end-to-end di Windows dengan preflight checks, logging, dan verifikasi otomatis.

## Ringkasan Alur
- Satu klik Windows: `download_all_categories.bat`
  - Install dependensi dataset (pip + requirements_datasets.txt)
  - Preflight checks (internet, Kaggle credentials/CLI, disk space)
  - Orkestrasi unduhan per kategori (A–D) via PowerShell script
  - Verifikasi hasil unduhan (robust) dan output laporan
  - Log lengkap: `datasets_download.log` dan `datasets_verify.log`

## Quick Start

### Metode 1: Satu-Klik (Windows)
1) Double-click `download_all_categories.bat`
2) Ikuti proses di layar (otomatis install dependencies, preflight, download, verify)
3) Cek log hasil:
   - `datasets_download.log` untuk proses download
   - `datasets_verify.log` untuk hasil verifikasi

### Metode 2: Command Line
- Orkestrasi unduhan:
  ```bash
  python download_all_datasets_enhanced.py
  ```
- Verifikasi manual:
  ```bash
  python verify_datasets.py
  ```

## Prasyarat

- Python 3.8+
- pip (tersedia default di instalasi Python)
- Kaggle API (hanya untuk dataset Kaggle)
  - Buat token di https://www.kaggle.com/settings/account → Create New API Token
  - Simpan `kaggle.json` ke salah satu lokasi:
    - Windows default: `C:\Users\<YourUser>\.kaggle\kaggle.json`
    - Atau gunakan env `KAGGLE_CONFIG_DIR` (mis. `C:\secure\kaggle`) lalu simpan `kaggle.json` di sana
- Dependencies Python (otomatis via batch):
  - `pip install -r requirements_datasets.txt`
  - Berisi: `requests`, `kaggle`, `datasets`

## Preflight Checks (otomatis)
- Konektivitas Internet: Kaggle, HuggingFace, GitHub
- Kredensial Kaggle: memverifikasi keberadaan `kaggle.json`
- Kaggle CLI: `kaggle --version`
- Kapasitas Disk: total/used/free + rekomendasi untuk kategori besar
- Jika tidak ada internet, proses akan dihentikan lebih awal (exit code 2)
- Jika Kaggle CLI/credentials tidak ada, proses tetap lanjut untuk non-Kaggle items (HF/direct), namun di-warning

## Kategori Dataset (ringkas)
- A. Psychometrics
- B. CV/Jobs/Skills
- C. Education/Academic/Content
- D. Language/Conversation/General Knowledge

Detail per kategori dikelola oleh skrip PowerShell di `scripts/datasets/`.

## Verifikasi Dataset (robust)
- `verify_datasets.py` melakukan verifikasi fleksibel:
  - Mengenali dataset sebagai direktori atau file tunggal (zip/tar/jsonl)
  - Variasi nama dengan hyphen/underscore
  - Menandai dataset streaming besar tertentu sebagai "optional"
- Output:
  - Ringkasan di konsol
  - Laporan JSON: `datasets_verification_report.json`
  - Log verifikasi (saat dijalankan dari batch): `datasets_verify.log`

## Troubleshooting
- Kaggle credentials hilang
  - Pastikan `kaggle.json` berada di lokasi yang benar
  - Cek `kaggle datasets list` untuk menguji kredensial/CLI
- Koneksi/lambat/timeouts
  - Jalankan ulang batch; beberapa sumber (Kaggle/HF) kadang throttling
  - Gunakan jaringan stabil atau VPN bila perlu
- Disk penuh
  - Kategori D bisa membutuhkan ruang besar; kosongkan disk atau pindahkan root repo ke drive dengan ruang lebih lega
- Gagal unzip/clone
  - Cek `datasets_download.log` untuk error spesifik
  - Jalankan ulang kategori terkait atau unduh manual sesuai perintah di `scripts/datasets/README_DATASETS.md`

## Struktur Output (contoh)
```
datasets/
├── psychometric/
│   ├── big-five/
│   ├── ...
├── skills/
│   ├── job-descriptions/
│   ├── onet_db.zip (contoh file)
│   └── ...
├── academic/
│   ├── coursera-courses/
│   └── ...
└── language/
    ├── wikipedia-full/
    ├── natural-questions-full/
    └── ...
```

## Perintah Manual (jika diperlukan)
Lihat `scripts/datasets/README_DATASETS.md` untuk daftar perintah per kategori (Kaggle, HF, direct, GitHub) bila otomatis gagal.

## Langkah Setelah Download
- Jalankan verifikasi manual (opsional):
  ```bash
  python verify_datasets.py
  ```
- Lanjut ingest (bila diperlukan):
  ```bash
  npm run ingest:datasets
  ```

## Catatan Keamanan
- Jangan menyimpan token API dalam kode/sumber. Simpan di env manager atau file kredensial resmi (mis. `.kaggle/kaggle.json`).
- Revoke token yang pernah terpapar publik dan buat baru.
