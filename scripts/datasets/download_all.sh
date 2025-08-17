#!/usr/bin/env bash
set -euo pipefail
mkdir -p ./datasets

# A. Psychometrics
kaggle datasets download -d tunguz/big-five-personality-test -p ./datasets/big-five --unzip || true
kaggle datasets download -d hafiznouman786/student-mental-health -p ./datasets/student-mental-health --unzip || true
kaggle datasets download -d datasnaek/mbti-type -p ./datasets/mbti-type --unzip || true
kaggle datasets download -d lucasgreenwell/depression-anxiety-stress-scales-responses -p ./datasets/dass-responses --unzip || true
kaggle datasets download -d itsmesunil/student-learning-factors -p ./datasets/learning-factors --unzip || true

# B. CV / Jobs / Skills
kaggle datasets download -d ravishah1/job-description-dataset -p ./datasets/job-descriptions --unzip || true
# O*NET database
curl -L 'https://www.onetcenter.org/dl_files/database/db_28_2_text.zip' -o './datasets/onet.zip' || true

# C. Education / Academic / Content
curl -L 'https://archive.ics.uci.edu/static/public/320/student+performance.zip' -o './datasets/student_performance.zip' || true
kaggle datasets download -d siddharthm1698/coursera-course-dataset -p ./datasets/coursera-courses --unzip || true
kaggle datasets download -d Cornell-University/arxiv -p ./datasets/arxiv --unzip || true
kaggle datasets download -d miguelcorraljr/ted-ultimate-dataset -p ./datasets/ted-talks --unzip || true

# Hugging Face
python scripts/datasets/download_hf_resume.py || true
python scripts/datasets/download_hf_advising.py || true

echo "All downloads attempted. Check ./datasets folder."

