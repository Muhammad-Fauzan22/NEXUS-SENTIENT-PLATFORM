#!/usr/bin/env python3
"""
NEXUS Platform Dataset Downloader
Downloads all datasets according to README_DATASETS.md instructions
"""

import os
import subprocess
import zipfile
import requests
from pathlib import Path

# Base directory for datasets
DATASETS_DIR = Path("./datasets")
DATASETS_DIR.mkdir(exist_ok=True)

def run_command(cmd, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, check=True, cwd=cwd)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {cmd}")
        print(f"Error: {e}")
        return False

def download_file(url, destination):
    """Download a file from URL"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(destination, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def unzip_file(zip_path, extract_to):
    """Unzip a file"""
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        return True
    except Exception as e:
        print(f"Error unzipping {zip_path}: {e}")
        return False

def download_kaggle_dataset(dataset, destination):
    """Download dataset from Kaggle"""
    cmd = f"kaggle datasets download -d {dataset} -p {destination} --unzip"
    return run_command(cmd)

def main():
    print("🚀 Starting NEXUS Platform Dataset Download...")
    
    # A. Psychometrics datasets
    print("\n📊 Downloading Psychometrics datasets...")
    
    psychometrics = [
        ("tunguz/big-five-personality-test", "big-five"),
        ("hafiznouman786/student-mental-health", "student-mental-health"),
        ("datasnaek/mbti-type", "mbti-type"),
        ("lucasgreenwell/depression-anxiety-stress-scales-responses", "dass-responses")
    ]
    
    for dataset, folder in psychometrics:
        folder_path = DATASETS_DIR / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        print(f"  Downloading {dataset}...")
        download_kaggle_dataset(dataset, str(folder_path))
    
    # B. CV/Jobs/Skills datasets
    print("\n💼 Downloading CV/Jobs/Skills datasets...")
    
    # Download HF resume dataset
    print("  Downloading HF resume dataset...")
    run_command("python scripts/datasets/download_hf_resume.py")
    
    # Job descriptions
    job_desc_path = DATASETS_DIR / "job-descriptions"
    job_desc_path.mkdir(parents=True, exist_ok=True)
    download_kaggle_dataset("ravishah1/job-description-dataset", str(job_desc_path))
    
    # SkillNER
    print("  Cloning SkillNER repository...")
    skillner_path = DATASETS_DIR / "skill-ner"
    run_command(f"git clone https://github.com/AnasAito/SkillNER.git {skillner_path}")
    
    # O*NET dataset
    print("  Downloading O*NET dataset...")
    onet_zip = DATASETS_DIR / "onet.zip"
    download_file(
        "https://www.onetcenter.org/dl_files/database/db_28_2_text.zip",
        str(onet_zip)
    )
    if onet_zip.exists():
        unzip_file(str(onet_zip), str(DATASETS_DIR / "onet"))
        onet_zip.unlink()  # Remove zip file
    
    # C. Education/Academic/Content datasets
    print("\n🎓 Downloading Education/Academic/Content datasets...")
    
    # Student performance
    student_perf_zip = DATASETS_DIR / "student_performance.zip"
    download_file(
        "https://archive.ics.uci.edu/static/public/320/student+performance.zip",
        str(student_perf_zip)
    )
    if student_perf_zip.exists():
        unzip_file(str(student_perf_zip), str(DATASETS_DIR / "student-performance"))
        student_perf_zip.unlink()
    
    # Coursera courses
    coursera_path = DATASETS_DIR / "coursera-courses"
    coursera_path.mkdir(parents=True, exist_ok=True)
    download_kaggle_dataset("siddharthm1698/coursera-course-dataset", str(coursera_path))
    
    # ArXiv
    arxiv_path = DATASETS_DIR / "arxiv"
    arxiv_path.mkdir(parents=True, exist_ok=True)
    download_kaggle_dataset("Cornell-University/arxiv", str(arxiv_path))
    
    # TED talks
    ted_path = DATASETS_DIR / "ted-talks"
    ted_path.mkdir(parents=True, exist_ok=True)
    download_kaggle_dataset("miguelcorraljr/ted-ultimate-dataset", str(ted_path))
    
    # HF academic advising
    print("  Downloading HF academic advising dataset...")
    run_command("python scripts/datasets/download_hf_advising.py")
    
    print("\n✅ All datasets downloaded successfully!")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Run ingestion: npm run ingest:datasets")
    print("3. Check ./datasets/ directory for downloaded files")

if __name__ == "__main__":
    main()
