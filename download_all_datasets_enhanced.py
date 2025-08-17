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
