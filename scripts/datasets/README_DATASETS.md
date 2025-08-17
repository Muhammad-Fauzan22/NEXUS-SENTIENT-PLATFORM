# NEXUS Datasets: Starter Pack and Acquisition Guide

This folder contains commands and helper scripts to fetch and prepare high‑value, free datasets for assessment, training, and evaluation in the NEXUS platform.

IMPORTANT
- Do not paste API tokens inside code. Keep tokens in your local env manager (Windows Credential Manager) or .kaggle/kaggle.json only.
- Run commands from repository root. Output will be placed under ./datasets.

Prereqs (run once)
1) Kaggle CLI
- Create API token in Kaggle → Settings → Create New Token → downloads kaggle.json
- Put kaggle.json into: C:\Users\\<YourUser>\\.kaggle\\kaggle.json
- Install CLI: pip install kaggle

2) Hugging Face datasets
- pip install datasets

3) Git
- git --version (ensure installed)

Folders used
- ./datasets/big-five
- ./datasets/student-mental-health
- ./datasets/mbti-type
- ./datasets/dass-responses
- ./datasets/job-descriptions
- ./datasets/skill-ner
- ./datasets/onet
- ./datasets/student-performance
- ./datasets/coursera-courses
- ./datasets/arxiv
- ./datasets/ted-talks
- ./datasets/hf-resume-ner
- ./datasets/hf-academic-advising

Quick commands (Windows PowerShell)
# A. Psychometrics
kaggle datasets download -d tunguz/big-five-personality-test -p ./datasets/big-five --unzip
kaggle datasets download -d hafiznouman786/student-mental-health -p ./datasets/student-mental-health --unzip
kaggle datasets download -d datasnaek/mbti-type -p ./datasets/mbti-type --unzip
kaggle datasets download -d lucasgreenwell/depression-anxiety-stress-scales-responses -p ./datasets/dass-responses --unzip

# B. CV / Jobs / Skills
python scripts/datasets/download_hf_resume.py
kaggle datasets download -d ravishah1/job-description-dataset -p ./datasets/job-descriptions --unzip
git clone https://github.com/AnasAito/SkillNER.git ./datasets/skill-ner
powershell -Command "Invoke-WebRequest -Uri 'https://www.onetcenter.org/dl_files/database/db_28_2_text.zip' -OutFile './datasets/onet.zip'"

# C. Education / Academic / Content
powershell -Command "Invoke-WebRequest -Uri 'https://archive.ics.uci.edu/static/public/320/student+performance.zip' -OutFile './datasets/student_performance.zip'"
kaggle datasets download -d siddharthm1698/coursera-course-dataset -p ./datasets/coursera-courses --unzip
kaggle datasets download -d Cornell-University/arxiv -p ./datasets/arxiv --unzip
kaggle datasets download -d miguelcorraljr/ted-ultimate-dataset -p ./datasets/ted-talks --unzip
python scripts/datasets/download_hf_advising.py

After download
- Unzip any .zip files if not auto‑unzipped
- You can now run: npm run ingest:datasets (see below)

Ingestion into vector DB (Supabase)
- The script scripts/ingest_datasets.ts will traverse selected files and push text chunks into the knowledge_chunks table, generating embeddings using your configured provider.

Run ingestion
npm run ingest:datasets

Environment needed for ingestion
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- LOCAL/remote embeddings provider env (same as existing ETL uses)

Notion integration
- Do NOT paste your Notion token into code. Set NOTION_API_KEY in your environment.
- For targeted Notion docs: set NOTION_DOCS_DATABASE_ID and NOTION_DOC_NAMES (comma separated)
- For generic Notion KB: set NOTION_KB_DATABASE_ID

Security note for tokens in chat
- If any token was ever posted in chat, revoke it immediately in the respective provider and create a new one before proceeding.

