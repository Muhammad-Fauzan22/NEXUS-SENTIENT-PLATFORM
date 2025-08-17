#!/usr/bin/env python3
"""
Enhanced Auto Git Sync for VSCode
Real-time sync with VSCode integration and better file watching
"""

import os
import time
import subprocess
import threading
from datetime import datetime
from pathlib import Path
import logging
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

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

class GitSyncHandler(FileSystemEventHandler):
    def __init__(self, sync_instance):
        self.sync_instance = sync_instance
        self.last_event = 0
        self.debounce_seconds = 2
        
    def on_modified(self, event):
        if event.is_directory:
            return
            
        # Debounce events
        current_time = time.time()
        if current_time - self.last_event < self.debounce_seconds:
            return
            
        self.last_event = current_time
        
        # Check if file should be synced
        if self.should_sync_file(event.src_path):
            logger.info(f"File changed: {event.src_path}")
            self.sync_instance.schedule_sync()
    
    def on_created(self, event):
        if not event.is_directory:
            self.on_modified(event)
    
    def should_sync_file(self, filepath):
        """Check if file should trigger sync"""
        ignore_patterns = [
            '.git',
            'node_modules',
            '.next',
            'dist',
            'build',
            'auto_git_sync.log',
            '.env.local',
            '.env.production'
        ]
        
        path = Path(filepath)
        for pattern in ignore_patterns:
            if pattern in str(path):
                return False
        return True

class VSCodeAutoGitSync:
    def __init__(self, repo_path=".", remote_name="origin", branch="main"):
        self.repo_path = Path(repo_path).absolute()
        self.remote_name = remote_name
        self.branch = branch
        self.last_commit_hash = None
        self.running = False
        self.sync_scheduled = False
        self.sync_thread = None
        
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
        
        commit_msg = f"🔄 Auto-sync: {file_list} - {datetime.now().strftime('%H:%M:%S')}"
        
        # Commit
        result = self.run_git_command(["git", "commit", "-m", commit_msg])
        if result is not None:
            logger.info(f"✅ Committed: {commit_msg}")
            return True
        return False
    
    def push_changes(self):
        """Push changes to remote repository"""
        result = self.run_git_command(["git", "push", self.remote_name, self.branch])
        if result is not None:
            logger.info("🚀 Changes pushed to GitHub")
            return True
        return False
    
    def sync_now(self):
        """Perform immediate sync"""
        if self.has_changes():
            logger.info("📝 Detected file changes...")
            if self.commit_changes():
                self.push_changes()
                self.last_commit_hash = self.get_current_commit_hash()
                return True
        return False
    
    def schedule_sync(self):
        """Schedule a sync after debounce period"""
        if self.sync_scheduled:
            return
            
        self.sync_scheduled = True
        
        def delayed_sync():
            time.sleep(3)  # Wait for file operations to complete
            self.sync_now()
            self.sync_scheduled = False
            
        threading.Thread(target=delayed_sync, daemon=True).start()
    
    def start_file_watching(self):
        """Start watching files for changes"""
        event_handler = GitSyncHandler(self)
        observer = Observer()
        observer.schedule(event_handler, str(self.repo_path), recursive=True)
        observer.start()
        return observer
    
    def create_vscode_settings(self):
        """Create VSCode settings for auto-save"""
        vscode_dir = self.repo_path / ".vscode"
        vscode_dir.mkdir(exist_ok=True)
        
        settings = {
            "files.autoSave": "afterDelay",
            "files.autoSaveDelay": 1000,
            "git.enableSmartCommit": True,
            "git.autofetch": True,
            "git.confirmSync": False
        }
        
        settings_file = vscode_dir / "settings.json"
        with open(settings_file, 'w') as f:
            json.dump(settings, f, indent=2)
        
        logger.info("✅ VSCode settings created for auto-save")
    
    def start_monitoring(self):
        """Start monitoring for changes"""
        self.running = True
        
        # Create VSCode settings
        self.create_vscode_settings()
        
        # Start file watching
        observer = self.start_file_watching()
        
        logger.info("🎯 Starting VSCode auto-git-sync monitoring...")
        logger.info("💡 Make sure VSCode auto-save is enabled!")
        
        try:
            # Initial sync
            self.sync_now()
            
            # Keep the main thread alive
            while self.running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            logger.info("🛑 Stopping auto-git-sync...")
            self.running = False
            observer.stop()
            observer.join()
    
    def get_status(self):
        """Get current sync status"""
        return {
            "running": self.running,
            "has_changes": self.has_changes(),
            "current_branch": self.run_git_command(["git", "branch", "--show-current"]),
            "last_commit": self.run_git_command(["git", "log", "-1", "--pretty=format:%h %s"]),
            "remote_url": self.run_git_command(["git", "config", "--get", f"remote.{self.remote_name}.url"])
        }

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="VSCode Auto Git Sync")
    parser.add_argument("--interval", type=int, default=5, help="Check interval in seconds")
    parser.add_argument("--repo", default=".", help="Repository path")
    parser.add_argument("--remote", default="origin", help="Remote name")
    parser.add_argument("--branch", default="main", help="Branch name")
    parser.add_argument("--status", action="store_true", help="Show status")
    
    args = parser.parse_args()
    
    sync = VSCodeAutoGitSync(args.repo, args.remote, args.branch)
    
    if args.status:
        status = sync.get_status()
        print(json.dumps(status, indent=2))
        return
    
    # Check if git repository exists
    if not os.path.exists(os.path.join(args.repo, ".git")):
        logger.error("❌ Not a git repository!")
        return
    
    # Check remote
    remotes = sync.run_git_command(["git", "remote"])
    if args.remote not in (remotes or ""):
        logger.error(f"❌ Remote '{args.remote}' not found!")
        return
    
    # Check if authenticated
    auth_status = sync.run_git_command(["gh", "auth", "status"])
    if not auth_status:
        logger.error("❌ GitHub CLI not authenticated. Run: gh auth login")
        return
    
    sync.start_monitoring()

if __name__ == "__main__":
    main()
