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
        
