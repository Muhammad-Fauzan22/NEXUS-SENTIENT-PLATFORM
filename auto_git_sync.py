#!/usr/bin/env python3
"""
Auto Git Sync - Automatically commit and push changes to GitHub
Monitors file changes and syncs to GitHub in real-time
"""

import os
import time
import subprocess
import threading
from datetime import datetime
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('auto_git_sync.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AutoGitSync:
    def __init__(self, repo_path=".", remote_name="origin", branch="main"):
        self.repo_path = Path(repo_path).absolute()
        self.remote_name = remote_name
        self.branch = branch
        self.last_commit_hash = None
        self.running = False
        
    def run_git_command(self, command):
        """Run git command and return output"""
        try:
            result = subprocess.run(
                command,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            logger.error(f"Git command failed: {e.stderr}")
            return None
    
    def get_current_commit_hash(self):
        """Get current commit hash"""
        return self.run_git_command(["git", "rev-parse", "HEAD"])
    
    def has_changes(self):
        """Check if there are uncommitted changes"""
        status = self.run_git_command(["git", "status", "--porcelain"])
        return bool(status and status.strip())
    
    def get_changed_files(self):
        """Get list of changed files"""
        output = self.run_git_command(["git", "status", "--porcelain"])
        if not output:
            return []
        
        files = []
        for line in output.strip().split('\n'):
            if line:
                status = line[:2]
                filename = line[3:]
                files.append((status, filename))
        return files
    
    def commit_changes(self):
        """Commit all changes with auto-generated message"""
        if not self.has_changes():
            return False
            
        # Add all changes
        self.run_git_command(["git", "add", "."])
        
        # Generate commit message
        changed_files = self.get_changed_files()
        file_list = ", ".join([f[1] for f in changed_files[:3]])
        if len(changed_files) > 3:
            file_list += f" and {len(changed_files) - 3} more files"
        
        commit_msg = f"Auto-sync: {file_list} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        # Commit
        result = self.run_git_command(["git", "commit", "-m", commit_msg])
        if result is not None:
            logger.info(f"Committed: {commit_msg}")
            return True
        return False
    
    def push_changes(self):
        """Push changes to remote repository"""
        result = self.run_git_command(["git", "push", self.remote_name, self.branch])
        if result is not None:
            logger.info("Changes pushed to GitHub")
            return True
        return False
    
    def sync_once(self):
        """Perform one sync cycle"""
        if self.has_changes():
            logger.info("Detected file changes...")
            if self.commit_changes():
                self.push_changes()
                self.last_commit_hash = self.get_current_commit_hash()
    
    def start_monitoring(self, interval=10):
        """Start monitoring for changes"""
        self.running = True
        logger.info("Starting auto-git-sync monitoring...")
        
        # Initial sync
        self.sync_once()
        
        while self.running:
            try:
                self.sync_once()
                time.sleep(interval)
            except KeyboardInterrupt:
                logger.info("Stopping auto-git-sync...")
                self.running = False
                break
            except Exception as e:
                logger.error(f"Error during sync: {e}")
                time.sleep(interval)
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.running = False

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Auto Git Sync")
    parser.add_argument("--interval", type=int, default=10, help="Check interval in seconds")
    parser.add_argument("--repo", default=".", help="Repository path")
    parser.add_argument("--remote", default="origin", help="Remote name")
    parser.add_argument("--branch", default="main", help="Branch name")
    
    args = parser.parse_args()
    
    sync = AutoGitSync(args.repo, args.remote, args.branch)
    
    # Check if git repository exists
    if not os.path.exists(os.path.join(args.repo, ".git")):
        logger.error("Not a git repository!")
        return
    
    # Check remote
    remotes = sync.run_git_command(["git", "remote"])
    if args.remote not in (remotes or ""):
        logger.error(f"Remote '{args.remote}' not found!")
        return
    
    sync.start_monitoring(args.interval)

if __name__ == "__main__":
    main()
