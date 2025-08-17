#!/usr/bin/env python3
"""
Enhanced Real-time Git Auto-Sync with Instant Push
Ultra-fast realtime sync to GitHub with file-level precision
"""

import os
import time
import subprocess
import threading
import queue
from datetime import datetime
from pathlib import Path
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Setup enhanced logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('realtime_sync.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class RealtimeGitSync:
    def __init__(self, repo_path=".", remote="origin", branch="main"):
        self.repo_path = Path(repo_path).absolute()
        self.remote = remote
        self.branch = branch
        self.change_queue = queue.Queue()
        self.sync_thread = None
        self.running = False
        
    def run_git(self, cmd):
        """Execute git command safely"""
        try:
            result = subprocess.run(
                cmd,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            logger.error(f"Git error: {e.stderr}")
            return None
    
    def is_git_repo(self):
        """Check if directory is git repository"""
        return os.path.exists(self.repo_path / ".git")
    
    def has_remote(self):
        """Check if remote exists"""
        remotes = self.run_git(["git", "remote"])
        return self.remote in (remotes or "").splitlines()
    
    def get_changed_files(self):
        """Get list of changed files"""
        output = self.run_git(["git", "status", "--porcelain"])
        if not output:
            return []
        
        files = []
        for line in output.strip().split('\n'):
            if line:
                status = line[:2]
                filename = line[3:]
                files.append((status, filename))
        return files
    
    def sync_changes(self, files_changed):
        """Sync specific changes to GitHub"""
        if not files_changed:
            return False
            
        try:
            # Add specific files
            for status, filename in files_changed:
                if status in ['??', 'A ', ' M', 'MM']:
                    self.run_git(["git", "add", filename])
            
            # Create detailed commit message
            timestamp = datetime.now().strftime('%H:%M:%S')
            file_list = ", ".join([f[1] for f in files_changed[:3]])
            if len(files_changed) > 3:
                file_list += f" +{len(files_changed)-3} more"
            
            commit_msg = f"🔄 {timestamp} - {file_list}"
            
            # Commit
            self.run_git(["git", "commit", "-m", commit_msg])
            
            # Push with retry
            max_retries = 3
            for attempt in range(max_retries):
                result = self.run_git(["git", "push", self.remote, self.branch])
                if result is not None:
                    logger.info(f"✅ Synced: {commit_msg}")
                    return True
                time.sleep(2 ** attempt)  # Exponential backoff
            
            return False
            
        except Exception as e:
            logger.error(f"Sync failed: {e}")
            return False
    
    def start_realtime_sync(self):
        """Start realtime file monitoring"""
        if not self.is_git_repo():
            logger.error("❌ Not a git repository!")
            return False
            
        if not self.has_remote():
            logger.error(f"❌ Remote '{self.remote}' not found!")
            return False
        
        logger.info("🚀 Starting REALTIME GitHub sync...")
        logger.info(f"📁 Repository: {self.repo_path}")
        logger.info(f"🌐 Remote: {self.remote}/{self.branch}")
        
        # Initial sync
        initial_changes = self.get_changed_files()
        if initial_changes:
            logger.info(f"📊 Found {len(initial_changes)} pending changes...")
            self.sync_changes(initial_changes)
        
        # Setup file watcher
        event_handler = RealtimeSyncHandler(self)
        observer = Observer()
        observer.schedule(event_handler, str(self.repo_path), recursive=True)
        observer.start()
        
        self.running = True
        logger.info("✅ Realtime sync active! Monitoring for changes...")
        
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("🛑 Stopping realtime sync...")
            observer.stop()
        
        observer.join()
        return True

class RealtimeSyncHandler(FileSystemEventHandler):
    def __init__(self, sync_instance):
        self.sync = sync_instance
        self.last_event = 0
        self.debounce_time = 1  # seconds
        
    def should_ignore(self, path):
        """Ignore common non-source files"""
        ignore_patterns = [
            '.git', '__pycache__', '.pyc', '.pyo', '.pyd',
            '.env', '.venv', 'node_modules', '.next',
            'dist', 'build', '.DS_Store', '.log',
            '.tmp', '.temp', '.cache'
        ]
        return any(pattern in str(path) for pattern in ignore_patterns)
    
    def on_any_event(self, event):
        if event.is_directory or self.should_ignore(event.src_path):
            return
            
        current_time = time.time()
        if current_time - self.last_event < self.debounce_time:
            return
            
        self.last_event = current_time
        
        # Delay slightly to batch rapid changes
        threading.Timer(0.5, self.sync.sync_changes, [self.sync.get_changed_files()]).start()

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Enhanced Real-time Git Sync")
    parser.add_argument("--repo", default=".", help="Repository path")
    parser.add_argument("--remote", default="origin", help="Git remote name")
    parser.add_argument("--branch", default="main", help="Git branch name")
    parser.add_argument("--status", action="store_true", help="Show sync status")
    
    args = parser.parse_args()
    
    sync = RealtimeGitSync(args.repo, args.remote, args.branch)
    
    if args.status:
        changes = sync.get_changed_files()
        print(f"📊 Pending changes: {len(changes)}")
        for status, file in changes:
            print(f"  {status} {file}")
        return
    
    sync.start_realtime_sync()

if __name__ == "__main__":
    main()
