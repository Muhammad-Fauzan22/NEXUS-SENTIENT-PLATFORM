# NEXUS Datasets: Acquisition Guide (Updated)

Panduan resmi untuk mengunduh dataset NEXUS (starter pack dan tambahan) menggunakan alur satu‑klik, dengan preflight, logging, dan verifikasi otomatis.

IMPORTANT
- Jangan menaruh token API di dalam kode. Simpan token di env manager atau kaggle.json.
- Jalankan perintah dari root repository. Output berada di ./datasets.

## Alur Satu‑Klik (Disarankan)
- Jalankan: `download_all_categories.bat`
  - Install dependencies (requirements_datasets.txt)
  - Preflight (internet, Kaggle credentials/CLI, disk space)
  - Orkestrasi download kategori A–D (PowerShell)
  - Verifikasi otomatis (python verify_datasets.py)
  - Logging: `datasets_download.log` dan `datasets_verify.log`

## Prasyarat
1) Kaggle CLI + kredensial
- Buat API token di Kaggle → Settings → Create New Token → `kaggle.json`
- Simpan di: `C:\Users\<User>\.kaggle\kaggle.json` atau set `KAGGLE_CONFIG_DIR`
- Install CLI: `pip install kaggle`

2) Hugging Face Datasets
- `pip install datasets`

3) Git
- Pastikan `git --version` bekerja

## Struktur Folder (contoh)
- ./datasets/psychometric/... (Category A)
- ./datasets/skills/... (Category B)
- ./datasets/academic/... (Category C)
- ./datasets/language/... (Category D)

## Perintah Manual (Cadangan)
Gunakan jika otomatis gagal. Jalankan dari root repo.

A. Psychometrics (Kaggle)
```
kaggle datasets download -d tunguz/big-five-personality-test -p ./datasets/psychometric/big-five --unzip
kaggle datasets download -d hafiznouman786/student-mental-health -p ./datasets/psychometric/student-mental-health --unzip
kaggle datasets download -d datasnaek/mbti-type -p ./datasets/psychometric/mbti-type --unzip
kaggle datasets download -d lucasgreenwell/depression-anxiety-stress-scales-responses -p ./datasets/psychometric/dass-responses --unzip
```
Direct (opsional)
```
powershell -Command "Invoke-WebRequest -Uri 'https://openpsychometrics.org/_rawdata/RSES.zip' -OutFile './datasets/psychometric/self-esteem.zip'"
```

B. CV/Jobs/Skills
```
python scripts/datasets/download_hf_resume.py
kaggle datasets download -d ravishah1/job-description-dataset -p ./datasets/skills/job-descriptions --unzip
git clone https://github.com/AnasAito/SkillNER.git ./datasets/skills/skill-ner
powershell -Command "Invoke-WebRequest -Uri 'https://www.onetcenter.org/dl_files/database/db_28_2_text.zip' -OutFile './datasets/skills/onet_db.zip'"
```

C. Education/Academic/Content
```
powershell -Command "Invoke-WebRequest -Uri 'https://archive.ics.uci.edu/static/public/320/student+performance.zip' -OutFile './datasets/academic/student_performance.zip'"
kaggle datasets download -d siddharthm1698/coursera-course-dataset -p ./datasets/academic/coursera-courses --unzip
kaggle datasets download -d Cornell-University/arxiv -p ./datasets/academic/arxiv --unzip
kaggle datasets download -d miguelcorraljr/ted-ultimate-dataset -p ./datasets/academic/ted-talks --unzip
python scripts/datasets/download_hf_advising.py
```

D. Language/Conversation/General Knowledge (HF/Kaggle/Direct)
- Perintah lengkap sudah di `scripts/datasets/download_category_D.ps1`.
- Beberapa dataset besar hanya di-stream (The Pile) dan ditandai optional di verifikasi.

## Verifikasi Dataset (Robust)
- Jalankan manual: `python verify_datasets.py`
- Fitur:
  - Deteksi direktori atau file tunggal (zip, tar, jsonl)
  - Variasi nama hyphen/underscore
  - Optional dataset (contoh: The Pile streaming)
- Output JSON: `datasets_verification_report.json`

## Troubleshooting Cepat
- Kaggle error: pastikan `kaggle.json` benar dan `kaggle datasets list` berjalan
- Timeout/Rate limit: jalankan ulang, gunakan koneksi stabil atau VPN
- Disk penuh: pindahkan repo atau kosongkan ruang; kategori D besar
- Gagal unzip/clone: cek `datasets_download.log` untuk error spesifik, ulang per kategori

## Ingest ke Vector DB (opsional)
- Ikuti petunjuk di ETL/ingestion (mis. `npm run ingest:datasets` dan set environment Supabase/embeddings)

Security Note
- Revoke token yang pernah terpapar dan buat yang baru. Jangan taruh token di kode.
