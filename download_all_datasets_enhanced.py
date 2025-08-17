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
