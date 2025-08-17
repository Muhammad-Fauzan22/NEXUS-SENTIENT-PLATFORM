# NEXUS-SENTIENT-PLATFORM — HMM Digital HQ (Mandiri)

Blueprint Absolut & Final v2.0: Pembangunan Markas Digital HMM yang Mandiri di satu Repl (FastAPI + SvelteKit + PostgreSQL + Model AI Lokal).

Fokus: arsitektur gratis/open-source, LLM & Embeddings lokal (tanpa API berbayar), integrasi Notion/Slack/Teams/Drive, serta ETL RAG dokumen HMM.

---

## 1) Konsep Inti — Ekosistem Ganda
- Sayap Organisasi (Otak Kolektif): Notion sebagai Single Source of Truth (SOP, Proker, Anggota, Arsip). Integrasi via Notion API.
- Sayap Personal (NEXUS — Pelatih Pribadi): Aplikasi web di Replit, untuk asesmen, IDP, dan jembatan ke peluang di Notion.

---

## 2) Arsitektur Teknis
- Backend: Python FastAPI
- Frontend: SvelteKit (TypeScript)
- Database: Replit PostgreSQL (atau PostgreSQL standar)
- Integrasi: Notion API (wajib), Slack/Teams (opsional), Google Drive (opsional)
- AI Lokal:
  - LLM: GGUF via llama.cpp/llama-cpp-python (default: Mistral-7B-Instruct Q4_K_M; fallback ringan: Qwen2.5-3B-Instruct Q4_K_M)
  - Embeddings: sentence-transformers/all-MiniLM-L6-v2 (CPU)

Catatan Replit: Mistral 7B kuantisasi 4-bit tetap berat. Jika memori terbatas, gunakan Qwen 3B/LLama 3.2 3B Instruct GGUF 4-bit.

---

## 3) Struktur Direktori
```
.
├─ backend/
│  ├─ __init__.py
│  ├─ main.py                # FastAPI app + endpoints
│  ├─ ai_core.py             # llama-cpp chat + IDP generation
│  ├─ embedding_service.py   # SentenceTransformer loader + embed_texts
│  ├─ notion_service.py      # Integrasi Notion API
│  ├─ db.py                  # SQLAlchemy engine/session + models
│  ├─ schemas.py             # Pydantic schemas
│  └─ config.py              # Env loader (tokens, DB URL, paths)
├─ scripts/
│  └─ etl.py                 # ETL: tarik dokumen Notion -> chunk -> embed -> simpan ke DB
├─ models/
│  └─ download_models.py     # Unduh model GGUF + embeddings ke lokal
├─ data/                     # Cache/artefak opsional (embeddings cache, dsb.)
├─ frontend/                 # SvelteKit app (buat via create svelte@latest)
├─ requirements.txt
├─ replit.nix                # Dependensi sistem Replit (cmake, gcc, openblas, python, node, dll.)
└─ README.md
```

---

## 4) Variabel Lingkungan (Secrets)
Set di Replit Secrets atau .env lokal:
- NOTION_TOKEN
- NOTION_DB_PROJECTS_ID      # DB Program Kerja Utama
- NOTION_DB_DOCS_ID          # DB Dokumen & Arsip Utama
- DATABASE_URL               # Replit Postgres atau URL Postgres lain
- (Opsional) SLACK_BOT_TOKEN, TEAMS_BOT_ID, TEAMS_BOT_PASSWORD
- (Opsional) GOOGLE_SERVICE_ACCOUNT_JSON (string JSON / base64)

---

## 5) Setup Replit
1) Buat Repl baru (Python — FastAPI).  
2) Tambahkan file replit.nix dan requirements.txt (lihat bagian 8 & 9).  
3) Set Secrets (lihat bagian 4).  
4) Inisialisasi frontend:  
   - Jalankan: `npx create svelte@latest frontend`  
   - Pilih: Skeleton + TypeScript + ESLint + Prettier  
   - `cd frontend && npm install`  
5) Unduh model lokal: `python models/download_models.py`  
6) Jalankan backend: `uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload`  
7) Jalankan frontend: `npm run dev -- --host 0.0.0.0 --port 5173`

---

## 6) Setup Lokal (opsional)
- Prasyarat: Python 3.11, Node.js 20, cmake, gcc, OpenBLAS (untuk build llama-cpp-python)
- Instal deps Python: `python -m venv .venv && .venv/Scripts/pip install -r requirements.txt` (Windows)  
- Env vars: buat `.env` dengan isi variabel pada bagian 4.  
- Jalankan backend/frontend sesuai perintah di atas.

---

## 7) Alur Operasional
- ETL dokumen:
  - `python scripts/etl.py --refresh`  
  - Menarik dokumen penting dari Notion (filter Kategori/SOP/Arsip), chunking, embed via MiniLM, simpan ke DB.
- Chat Asesmen (LLM lokal) via `/api/chat`  
- Generate IDP via `/api/idp`  
- Peluang HMM (Open Projects) via `/api/opportunities`  
- Dokumen tertentu via `/api/docs/{name}`  
- Pencarian RAG via `/api/search` (cosine similarity lokal)

---

## 8) replit.nix (disarankan)
```
{ pkgs }: {
  deps = [
    pkgs.python311Full
    pkgs.python311Packages.pip
    pkgs.nodejs_20
    pkgs.cmake
    pkgs.gcc
    pkgs.gnumake
    pkgs.openblas
    pkgs.git
    pkgs.pkg-config
  ];
}
```

---

## 9) requirements.txt (disarankan)
```
fastapi==0.111.0
uvicorn[standard]==0.30.0
pydantic==2.7.1
httpx==0.27.0
python-dotenv==1.0.1
sqlalchemy==2.0.30
psycopg2-binary==2.9.9
notion-client==2.2.1
sentence-transformers==2.7.0
numpy==1.26.4
huggingface-hub==0.23.2
llama-cpp-python==0.2.76
```

---

## 10) Endpoint Ringkas
- GET `/health` → ok
- POST `/api/chat` → { messages: [{role, content}, ...] } → balasan LLM lokal
- POST `/api/idp` → { profile: {...} } → rencana IDP
- GET `/api/opportunities` → daftar proyek status Open dari Notion
- GET `/api/docs/{name}` → konten dokumen
- POST `/api/search` → { query: string } → hasil RAG top-k

---

## 11) Asumsi Skema Notion (Saran)
- DB Program Kerja Utama: Properties minimal → `Name` (title), `Status` (select: Open/Closed), `Divisi` (multi-select), `Deskripsi` (rich text), `Link Pendaftaran` (url)
- DB Dokumen & Arsip Utama: `Name` (title), `Kategori` (select: KDKMM/SOP/Arsip/Lainnya), `Konten` (rich text/blocks)
Catat `database_id` masing-masing untuk Secrets.

---

## 12) Model Lokal dan Performa
- Default: Mistral-7B-Instruct-Q4_K_M (GGUF) → kualitas baik, kebutuhan memori lebih besar.
- Fallback: Qwen2.5-3B-Instruct-Q4_K_M (GGUF) → lebih ringan, latensi lebih rendah di Replit.
- Atur `n_threads` (mis. 2) dan `n_ctx` (2048–3072) agar stabil. Sesuaikan file `backend/ai_core.py`.

---

## 13) Langkah Berikutnya (Roadmap Otomasi)
- Tambah scheduler ETL incremental (berdasar `last_edited_time` Notion).
- Caching embeddings ke file `data/` untuk query cepat.
- Integrasi webhook Slack/Teams (opsional tahap awal, bisa polling dulu).
- Hardening: rate limit API, auth minimal JWT, logging terstruktur.

---

## 14) Troubleshooting
- Build `llama-cpp-python` gagal → pastikan cmake/gcc/openblas ada (replit.nix). Turunkan ke model GGUF 3B.
- OOM saat load model → pakai file GGUF kuantisasi lebih ketat (Q4_K_S/Q5_0) atau model 3B.
- Notion tidak mengembalikan konten lengkap → gunakan endpoint blocks children untuk gabung teks.
- Replit Postgres: pastikan `DATABASE_URL` tersedia atau gunakan Replit DB plugin.

---

Dokumen ini menjadi panduan operasional untuk men-setup, menjalankan, dan mengembangkan Markas Digital HMM yang sepenuhnya mandiri. Lanjutkan dengan pembuatan file kode sesuai struktur di atas, menjalankan unduh model, dan menguji endpoint backend terlebih dahulu sebelum menghubungkan frontend SvelteKit.
