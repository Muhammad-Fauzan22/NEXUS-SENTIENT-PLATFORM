#!/usr/bin/env python3
"""
Ultimate Real-Time GitHub Sync for VSCode
Complete workflow with enterprise-grade features
"""

import os
import sys
import json
import time
import subprocess
import threading
import logging
from datetime import datetime
from pathlib import Path
import hashlib
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import psutil

# Enhanced logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ultimate_sync.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('UltimateSync')

class VSCodeIntegration:
    """VSCode-specific integration utilities"""
    
    def __init__(self, workspace_path):
        self.workspace_path = Path(workspace_path)
        self.vscode_dir = self.workspace_path / '.vscode'
        
    def setup_vscode_workspace(self):
        """Configure VSCode workspace for optimal sync"""
        self.vscode_dir.mkdir(exist_ok=True)
        
        # VSCode settings for auto-save
        settings = {
            "files.autoSave": "afterDelay",
            "files.autoSaveDelay": 1000,
            "git.autofetch": True,
            "git.enableSmartCommit": True,
            "git.postCommitCommand": "push",
            "workbench.colorCustomizations": {
                "statusBar.background": "#007acc",
                "statusBar.noFolderBackground": "#68217a"
            }
        }
        
        with open(self.vscode_dir / 'settings.json', 'w') as f:
            json.dump(settings, f, indent=2)
            
        # VSCode tasks for git sync
        tasks = {
            "version": "2.0.0",
            "tasks": [
                {
                    "label": "Start Real-time Git Sync",
                    "type": "shell",
                    "command": "python",
                    "args": ["ultimate_realtime_sync.py"],
                    "group": "build",
                    "presentation": {
                        "echo": True,
                        "reveal": "always",
                        "focus": False,
                        "panel": "shared"
                    }
                }
            ]
        }
        
        with open(self.vscode_dir / 'tasks.json', 'w') as f:
            json.dump(tasks, f, indent=2)

class GitHubAPI:
    """GitHub API integration for enhanced features"""
    
    def __init__(self, token, repo_owner, repo_name):
        self.token = token
        self.repo_owner = repo_owner
        self.repo_name = repo_name
        self.base_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}"
        self.headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json'
        }
    
    def get_repo_info(self):
        """Get repository information"""
        try:
            response = requests.get(self.base_url, headers=self.headers)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get repo info: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"GitHub API error: {e}")
            return None
    
    def create_commit_status(self, sha, state, description):
        """Create commit status via API"""
        url = f"{self.base_url}/statuses/{sha}"
        data = {
            "state": state,
            "description": description,
            "context": "continuous-integration/ultimate-sync"
        }
        try:
            response = requests.post(url, json=data, headers=self.headers)
            return response.status_code == 201
        except Exception as e:
            logger.error(f"Failed to create commit status: {e}")
            return False

class FileHasher:
    """File hashing for change detection"""
    
    @staticmethod
    def get_file_hash(filepath):
        """Get MD5 hash of file"""
        try:
            with open(filepath, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return None
    
    @staticmethod
    def has_file_changed(filepath, old_hash):
        """Check if file has changed"""
        new_hash = FileHasher.get_file_hash(filepath)
        return new_hash != old_hash

class UltimateRealtimeSync:
    """Ultimate real-time GitHub sync with all features"""
    
    def __init__(self, repo_path=".", remote="origin", branch="main"):
        self.repo_path = Path(repo_path).absolute()
        self.remote = remote
        self.branch = branch
        self.config_file = self.repo_path / 'sync_config.json'
        self.vscode = VSCodeIntegration(self.repo_path)
        self.github = None
        self.file_hashes = {}
        self.running = False
        
        self.load_config()
        self.setup_logging()
        
    def load_config(self):
        """Load configuration from file"""
        default_config = {
            "github_token": os.getenv('GITHUB_TOKEN', ''),
            "repo_owner": "Muhammad-Fauzan22",
            "repo_name": "NEXUS-SENTIENT-PLATFORM",
            "sync_delay": 2,
            "ignore_patterns": [
                ".git", "__pycache__", ".pyc", ".pyo", ".pyd",
                ".env", ".venv", "venv", "node_modules", ".next",
                "dist", "build", ".DS_Store", "*.log", "*.tmp",
                "*.temp", "*.cache", ".vscode/settings.json"
            ],
            "auto_commit": True,
            "push_on_commit": True,
            "commit_style": "detailed"
        }
        
        if self.config_file.exists():
            with open(self.config_file) as f:
                config = json.load(f)
        else:
            config = default_config
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
        
        self.config = config
        
        if self.config['github_token']:
            self.github = GitHubAPI(
                self.config['github_token'],
                self.config['repo_owner'],
                self.config['repo_name']
            )
    
    def setup_logging(self):
        """Setup enhanced logging"""
        log_file = self.repo_path / 'ultimate_sync.log'
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger('UltimateSync')
    
    def is_git_repo(self):
        """Check if directory is git repository"""
        return (self.repo_path / ".git").exists()
    
    def has_remote(self):
        """Check if remote exists"""
        try:
            result = subprocess.run(
                ["git", "remote", "get-url", self.remote],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except:
            return False
    
    def setup_git_repo(self):
        """Initialize git repository if needed"""
        if not self.is_git_repo():
            subprocess.run(["git", "init"], cwd=self.repo_path, check=True)
            subprocess.run(["git", "branch", "-M", self.branch], cwd=self.repo_path, check=True)
            
            # Setup remote
            remote_url = f"https://github.com/{self.config['repo_owner']}/{self.config['repo_name']}.git"
            auth_url = remote_url.replace('https://', f'https://{self.config["github_token"]}@')
            subprocess.run(["git", "remote", "add", self.remote, auth_url], cwd=self.repo_path, check=True)
    
    def get_changed_files(self):
        """Get list of changed files"""
        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                return []
                
            files = []
            for line in result.stdout.strip().split('\n'):
                if line:
                    status = line[:2]
                    filename = line[3:]
                    files.append((status, filename))
            return files
        except:
            return []
    
    def generate_commit_message(self, files_changed):
        """Generate intelligent commit message"""
        if not files_changed:
            return "Empty commit"
        
        timestamp = datetime.now().strftime('%H:%M:%S')
        
        if len(files_changed) == 1:
            status, filename = files_changed[0]
            action = {
                'A': 'Add',
                'M': 'Update',
                'D': 'Delete',
                'R': 'Rename',
                '??': 'Add'
            }.get(status.strip(), 'Modify')
            return f"📝 {action}: {filename} at {timestamp}"
        
        # Multiple files
        file_types = {}
        for status, filename in files_changed:
            ext = Path(filename).suffix
            if ext not in file_types:
                file_types[ext] = 0
            file_types[ext] += 1
        
        file_summary = ", ".join([f"{count} {ext}" for ext, count in list(file_types.items())[:3]])
        if len(file_types) > 3:
            file_summary += f" +{len(file_types)-3} more"
        
        return f"🔄 Sync: {file_summary} at {timestamp}"
    
    def sync_changes(self, files_changed):
        """Sync changes to GitHub"""
        if not files_changed:
            return True
        
        try:
            # Stage files
            for status, filename in files_changed:
                if status in ['??', 'A ', ' M', 'MM']:
                    subprocess.run(["git", "add", filename], cwd=self.repo_path, check=True)
            
            # Check if there are changes to commit
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            
            if not result.stdout.strip():
                return True
            
            # Commit
            commit_msg = self.generate_commit_message(files_changed)
            subprocess.run(
                ["git", "commit", "-m", commit_msg],
                cwd=self.repo_path,
                check=True
            )
            
            # Push
            subprocess.run(
                ["git", "push", self.remote, self.branch],
                cwd=self.repo_path,
                check=True
            )
            
            self.logger.info(f"✅ Synced: {commit_msg}")
            return True
            
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Sync failed: {e}")
            return False
    
    def start_realtime_sync(self):
        """Start real-time sync"""
        if not self.is_git_repo():
            self.setup_git_repo()
        
        if not self.has_remote():
            self.setup_git_repo()
        
        self.vscode.setup_vscode_workspace()
        
        # Initial sync
        initial_changes = self.get_changed_files()
        if initial_changes:
            self.sync_changes(initial_changes)
        
        logger.info("🚀 Starting ultimate real-time sync...")
        logger.info(f"📁 Repository: {self.repo_path}")
        logger.info(f"🌐 Remote: {self.config['repo_owner']}/{self.config['repo_name']}")
        
        # Simple polling-based sync
        self.running = True
        last_check = time.time()
        
        try:
            while self.running:
                current_time = time.time()
                if current_time - last_check >= self.config['sync_delay']:
                    changes = self.get_changed_files()
                    if changes:
                        self.sync_changes(changes)
                    last_check = current_time
                time.sleep(0.5)
                
        except KeyboardInterrupt:
            logger.info("🛑 Stopping sync...")
            self.running = False

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Ultimate Real-time GitHub Sync")
    parser.add_argument("--repo", default=".", help="Repository path")
    parser.add_argument("--remote", default="origin", help="Git remote name")
    parser.add_argument("--branch", default="main", help="Git branch name")
    
    args = parser.parse_args()
    
    sync = UltimateRealtimeSync(args.repo, args.remote, args.branch)
    sync.start_realtime_sync()

if __name__ == "__main__":
    main()
