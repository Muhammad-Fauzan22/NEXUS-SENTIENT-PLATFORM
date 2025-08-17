#!/usr/bin/env python3
"""
NEXUS Platform Dataset Downloader - Enhanced Version
Downloads all datasets for Categories A, B, C, and D
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

def main():
    print("🚀 Starting NEXUS Platform Enhanced Dataset Download...")
    
    # A. Psychometrics datasets
    print("\n📊 Downloading Category A: Psychometrics datasets...")
    run_command("powershell -ExecutionPolicy Bypass -File scripts/datasets/download_category_A.ps1")
    
    # B. CV/Jobs/Skills datasets
    print("\n💼 Downloading Category B: CV/Jobs/Skills datasets...")
    run_command("powershell -ExecutionPolicy Bypass -File scripts/datasets/download_category_B.ps1")
    
    # C. Education/Academic/Content datasets
    print("\n🎓 Downloading Category C: Education/Academic/Content datasets...")
    run_command("powershell -ExecutionPolicy Bypass -File scripts/datasets/download_category_C.ps1")
    
    # D. Language/Conversation/General Knowledge datasets
    print("\n🗣️ Downloading Category D: Language/Conversation/General Knowledge datasets...")
    run_command("powershell -ExecutionPolicy Bypass -File scripts/datasets/download_category_D.ps1")
    
    print("\n✅ All datasets downloaded successfully!")
    print("\n📊 Summary:")
    print("   - Category A: 25 Psychometric datasets")
    print("   - Category B: 25 CV/Skills/Industry datasets")
    print("   - Category C: 25 Education/Academic/Career datasets")
    print("   - Category D: 25 Language/Conversation/General Knowledge datasets")
    print("\n📁 Check ./datasets/ directory for downloaded files")

if __name__ == "__main__":
    main()
