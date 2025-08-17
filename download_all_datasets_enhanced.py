#!/usr/bin/env python3
"""
Enhanced NEXUS Platform Dataset Downloader
Downloads all datasets with fallback methods and detailed instructions
"""

import os
import subprocess
import zipfile
import requests
import json
from pathlib import Path
import shutil

# Base directory for datasets
DATASETS_DIR = Path("./datasets")
DATASETS_DIR.mkdir(exist_ok=True)

def check_kaggle_credentials():
    """Check if Kaggle credentials are properly configured"""
    kaggle_dir = Path.home() / ".kaggle"
    kaggle_json = kaggle_dir / "kaggle.json"
    
    if not kaggle_json.exists():
        print("❌ Kaggle credentials not found!")
        print("📋 To set up Kaggle API:")
        print("   1. Go to https://www.kaggle.com/settings/account")
        print("   2. Click 'Create New API Token'")
        print("   3. Save kaggle.json to:", str(kaggle_json))
        print("   4. Re-run this script")
        return False
    
    try:
        with open(kaggle_json) as f:
            creds = json.load(f)
            if 'username' in creds and 'key' in creds:
                print("✅ Kaggle credentials found!")
                return True
    except:
        print("❌ Invalid kaggle.json format")
    return False

def run_command(cmd, cwd=None, ignore_errors=False):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, check=True, cwd=cwd, 
                              capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        if not ignore_errors:
            print(f"❌ Error: {e}")
        return False, e.stderr

def download_file(url, destination, description=""):
    """Download a file from URL with progress"""
    try:
        print(f"📥 Downloading {description}...")
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0
        
        with open(destination, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        progress = (downloaded / total_size) * 100
                        print(f"   Progress: {progress:.1f}%", end='\r')
        
        print(f"✅ {description} downloaded successfully!")
        return True
    except Exception as e:
        print(f"❌ Error downloading {description}: {e}")
        return False

def unzip_file(zip_path, extract_to):
    """Unzip a file with progress"""
    try:
        print(f"📦 Extracting {zip_path.name}...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        zip_path.unlink()  # Remove zip file
        print(f"✅ Extracted to {extract_to}")
        return True
    except Exception as e:
        print(f"❌ Error extracting {zip_path}: {e}")
        return False

def download_kaggle_dataset(dataset, destination):
    """Download dataset from Kaggle with error handling"""
    cmd = f"kaggle datasets download -d {dataset} -p {destination} --unzip"
    success, output = run_command(cmd, ignore_errors=True)
    if success:
        print(f"✅ Downloaded {dataset}")
    else:
        print(f"❌ Failed to download {dataset}")
    return success

def download_hf_dataset(dataset_name, save_path, dataset_path):
    """Download Hugging Face dataset with error handling"""
    try:
        from datasets import load_dataset
        print(f"📊 Downloading {dataset_name}...")
        ds = load_dataset(dataset_path)
        ds.save_to_disk(str(save_path))
        print(f"✅ {dataset_name} saved successfully!")
        return True
    except Exception as e:
        print(f"❌ Error downloading {dataset_name}: {e}")
        return False

def create_manual_download_guide():
    """Create a manual download guide for failed datasets"""
    guide_content = """
# Manual Download Guide for Failed Datasets

## Kaggle Datasets (Requires API Setup)
1. **Big Five Personality Test**
   - Dataset: `tunguz/big-five-personality-test`
   - Command: `kaggle datasets download -d tunguz/big-five-personality-test -p ./datasets/big-five --unzip`

2. **Student Mental Health**
   - Dataset: `hafiznouman786/student-mental-health`
   - Command: `kaggle datasets download -d hafiznouman786/student-mental-health -p ./datasets/student-mental-health --unzip`

3. **MBTI Type**
   - Dataset: `datasnaek/mbti-type`
   - Command: `kaggle datasets download -d datasnaek/mbti-type -p ./datasets/mbti-type --unzip`

4. **DASS Responses**
   - Dataset: `lucasgreenwell/depression-anxiety-stress-scales-responses`
   - Command: `kaggle datasets download -d lucasgreenwell/depression-anxiety-stress-scales-responses -p ./datasets/dass-responses --unzip`

5. **Job Descriptions**
   - Dataset: `ravishah1/job-description-dataset`
   - Command: `kaggle datasets download -d ravishah1/job-description-dataset -p ./datasets/job-descriptions --unzip`

6. **Coursera Courses**
   - Dataset: `siddharthm1698/coursera-course-dataset`
   - Command: `kaggle datasets download -d siddharthm1698/coursera-course-dataset -p ./datasets/coursera-courses --unzip`

7. **ArXiv**
   - Dataset: `Cornell-University/arxiv`
   - Command: `kaggle datasets download -d Cornell-University/arxiv -p ./datasets/arxiv --unzip`

8. **TED Talks**
   - Dataset: `miguelcorraljr/ted-ultimate-dataset`
   - Command: `kaggle datasets download -d miguelcorraljr/ted-ultimate-dataset -p ./datasets/ted-talks --unzip`

## Alternative Hugging Face Datasets
1. **Resume NER** - Try these alternatives:
   - `zeroshot/twitter-resume` 
   - `buseskorkmaz/wikiann_resume_ner`
   - `darentang/resumeNER`

2. **Academic Advising** - Try these alternatives:
   - `stanfordnlp/coqa`
   - `microsoft/DialoGPT`
   - `conv_ai_2`

## Direct Downloads
1. **O*NET Database**: Already downloaded ✅
2. **Student Performance**: Already downloaded ✅
3. **SkillNER**: Already cloned ✅
"""
    
    with open("MANUAL_DOWNLOAD_GUIDE.md", "w") as f:
        f.write(guide_content)
    print("📋 Manual download guide created: MANUAL_DOWNLOAD_GUIDE.md")

def main():
    print("🚀 Enhanced NEXUS Platform Dataset Downloader")
    print("=" * 50)
    
    # Check prerequisites
    kaggle_ready = check_kaggle_credentials()
    
    # Track successful downloads
    successful_downloads = []
    failed_downloads = []
    
    # Create datasets directory structure
    print("\n📁 Creating directory structure...")
    directories = [
        "big-five", "student-mental-health", "mbti-type", "dass-responses",
        "job-descriptions", "skill-ner", "onet", "student-performance",
        "coursera-courses", "arxiv", "ted-talks", "hf-resume-ner", "hf-academic-advising"
    ]
    
    for dir_name in directories:
        (DATASETS_DIR / dir_name).mkdir(parents=True, exist_ok=True)
    
    # A. Psychometrics datasets
    print("\n📊 Downloading Psychometrics datasets...")
    psychometrics = [
        ("tunguz/big-five-personality-test", "big-five"),
        ("hafiznouman786/student-mental-health", "student-mental-health"),
        ("datasnaek/mbti-type", "mbti-type"),
        ("lucasgreenwell/depression-anxiety-stress-scales-responses", "dass-responses")
    ]
    
    for dataset, folder in psychometrics:
        if kaggle_ready:
            success = download_kaggle_dataset(dataset, str(DATASETS_DIR / folder))
            if success:
                successful_downloads.append(f"Psychometrics/{folder}")
            else:
                failed_downloads.append(f"Psychometrics/{folder}")
        else:
            failed_downloads.append(f"Psychometrics/{folder}")
    
    # B. CV/Jobs/Skills datasets
    print("\n💼 Downloading CV/Jobs/Skills datasets...")
    
    # HF Resume NER
    success = download_hf_dataset("HF Resume NER", DATASETS_DIR / "hf-resume-ner", "zeroshot/twitter-resume")
    if success:
        successful_downloads.append("CV/hf-resume-ner")
    else:
        failed_downloads.append("CV/hf-resume-ner")
    
    # Job descriptions
    if kaggle_ready:
        success = download_kaggle_dataset("ravishah1/job-description-dataset", str(DATASETS_DIR / "job-descriptions"))
        if success:
            successful_downloads.append("CV/job-descriptions")
        else:
            failed_downloads.append("CV/job-descriptions")
    else:
        failed_downloads.append("CV/job-descriptions")
    
    # SkillNER
    skillner_path = DATASETS_DIR / "skill-ner"
    if not (skillner_path / "README.md").exists():
        success, _ = run_command(f"git clone https://github.com/AnasAito/SkillNER.git {skillner_path}")
        if success:
            successful_downloads.append("CV/skill-ner")
        else:
            failed_downloads.append("CV/skill-ner")
    else:
        successful_downloads.append("CV/skill-ner")
    
    # O*NET dataset
    onet_zip = DATASETS_DIR / "onet.zip"
    onet_url = "https://www.onetcenter.org/dl_files/database/db_28_2_text.zip"
    if download_file(onet_url, onet_zip, "O*NET Database"):
        if unzip_file(onet_zip, DATASETS_DIR / "onet"):
            successful_downloads.append("CV/onet")
        else:
            failed_downloads.append("CV/onet")
    else:
        failed_downloads.append("CV/onet")
    
    # C. Education/Academic/Content datasets
    print("\n🎓 Downloading Education/Academic/Content datasets...")
    
    # Student performance
    student_perf_zip = DATASETS_DIR / "student_performance.zip"
    student_url = "https://archive.ics.uci.edu/static/public/320/student+performance.zip"
    if download_file(student_url, student_perf_zip, "Student Performance"):
        if unzip_file(student_perf_zip, DATASETS_DIR / "student-performance"):
            successful_downloads.append("Education/student-performance")
        else:
            failed_downloads.append("Education/student-performance")
    else:
        failed_downloads.append("Education/student-performance")
    
    # Coursera courses
    if kaggle_ready:
        success = download_kaggle_dataset("siddharthm1698/coursera-course-dataset", str(DATASETS_DIR / "coursera-courses"))
        if success:
            successful_downloads.append("Education/coursera-courses")
        else:
            failed_downloads.append("Education/coursera-courses")
    else:
        failed_downloads.append("Education/coursera-courses")
    
    # ArXiv
    if kaggle_ready:
        success = download_kaggle_dataset("Cornell-University/arxiv", str(DATASETS_DIR / "arxiv"))
        if success:
