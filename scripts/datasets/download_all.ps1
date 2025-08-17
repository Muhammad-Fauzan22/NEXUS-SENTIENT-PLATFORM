# Requires: Kaggle CLI (pip install kaggle) and %USERPROFILE%\.kaggle\kaggle.json
# Usage: powershell -ExecutionPolicy Bypass -File scripts/datasets/download_all.ps1

New-Item -ItemType Directory -Force -Path ./datasets | Out-Null

# A. Psychometrics
kaggle datasets download -d tunguz/big-five-personality-test -p ./datasets/big-five --unzip
kaggle datasets download -d hafiznouman786/student-mental-health -p ./datasets/student-mental-health --unzip
kaggle datasets download -d datasnaek/mbti-type -p ./datasets/mbti-type --unzip
kaggle datasets download -d lucasgreenwell/depression-anxiety-stress-scales-responses -p ./datasets/dass-responses --unzip
kaggle datasets download -d itsmesunil/student-learning-factors -p ./datasets/learning-factors --unzip

# B. CV / Jobs / Skills
kaggle datasets download -d ravishah1/job-description-dataset -p ./datasets/job-descriptions --unzip
# O*NET database
Invoke-WebRequest -Uri 'https://www.onetcenter.org/dl_files/database/db_28_2_text.zip' -OutFile './datasets/onet.zip'

# C. Education / Academic / Content
Invoke-WebRequest -Uri 'https://archive.ics.uci.edu/static/public/320/student+performance.zip' -OutFile './datasets/student_performance.zip'
kaggle datasets download -d siddharthm1698/coursera-course-dataset -p ./datasets/coursera-courses --unzip
kaggle datasets download -d Cornell-University/arxiv -p ./datasets/arxiv --unzip
kaggle datasets download -d miguelcorraljr/ted-ultimate-dataset -p ./datasets/ted-talks --unzip

# Hugging Face (use python)
python scripts/datasets/download_hf_resume.py
python scripts/datasets/download_hf_advising.py

Write-Host "All downloads attempted. Check ./datasets folder." -ForegroundColor Green

